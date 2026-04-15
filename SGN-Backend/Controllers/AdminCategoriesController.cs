using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SGN.Domain.Entities;
using SGN.Domain.Interfaces;
using SGN_Backend.DTOs;

namespace SGN_Backend.Controllers;

/// <summary>
/// Admin plant categories.
/// </summary>
[Route("api/admin/categories")]
[ApiController]
[Authorize(Roles = "Admin")]
[ApiExplorerSettings(GroupName = "ADMIN")]
[Tags("Admin Categories")]
public class AdminCategoriesController : ControllerBase
{
    private readonly ICategoryRepository _categoryRepo;

    public AdminCategoriesController(ICategoryRepository categoryRepo)
    {
        _categoryRepo = categoryRepo;
    }

    /// <summary>
    /// List all categories
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(IEnumerable<Category>), 200)]
    public async Task<IActionResult> GetCategories()
    {
        var categories = await _categoryRepo.GetAllAsync();
        return Ok(categories.OrderBy(c => c.CategoryName));
    }

    /// <summary>
    /// Get category by id
    /// </summary>
    [HttpGet("{id:int}")]
    [ProducesResponseType(typeof(Category), 200)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> GetById(int id)
    {
        var category = await _categoryRepo.GetByIdAsync(id);
        if (category == null)
            return NotFound("Category not found");
        return Ok(category);
    }

    /// <summary>
    /// Create a new category.
    /// </summary>
    [HttpPost]
    [ProducesResponseType(typeof(Category), 201)]
    [ProducesResponseType(400)]
    public async Task<IActionResult> CreateCategory([FromBody] CreateCategoryDto dto)
    {
        var name = dto.CategoryName?.Trim();
        if (string.IsNullOrWhiteSpace(name))
            return BadRequest(new { message = "Category name is required." });

        var exists = (await _categoryRepo.GetAllAsync())
            .Any(c => c.CategoryName.Equals(name, StringComparison.OrdinalIgnoreCase));
        if (exists)
            return Conflict(new { message = "Category name already exists." });

        var created = await _categoryRepo.AddAsync(new Category { CategoryName = name });
        return CreatedAtAction(nameof(GetById), new { id = created.CategoryId }, created);
    }

    /// <summary>
    /// Update category by id.
    /// </summary>
    [HttpPut("{id:int}")]
    [ProducesResponseType(typeof(Category), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> UpdateCategory(int id, [FromBody] CreateCategoryDto dto)
    {
        var name = dto.CategoryName?.Trim();
        if (string.IsNullOrWhiteSpace(name))
            return BadRequest(new { message = "Category name is required." });

        var category = await _categoryRepo.GetByIdAsync(id);
        if (category == null)
            return NotFound(new { message = "Category not found." });

        var duplicate = (await _categoryRepo.GetAllAsync())
            .Any(c => c.CategoryId != id && c.CategoryName.Equals(name, StringComparison.OrdinalIgnoreCase));
        if (duplicate)
            return Conflict(new { message = "Category name already exists." });

        category.CategoryName = name;
        await _categoryRepo.UpdateAsync(category);
        return Ok(category);
    }

    /// <summary>
    /// Delete category by id.
    /// </summary>
    [HttpDelete("{id}")]
    [ProducesResponseType(200)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> DeleteCategory(int id)
    {
        var category = await _categoryRepo.GetByIdAsync(id);
        if (category == null)
            return NotFound(new { message = "Category not found." });

        await _categoryRepo.DeleteAsync(id);
        return Ok(new { message = "Category deleted successfully.", categoryId = id });
    }
}
