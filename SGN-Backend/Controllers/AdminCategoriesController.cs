using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SGN.Domain.Entities;
using SGN.Domain.Interfaces;

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
}
