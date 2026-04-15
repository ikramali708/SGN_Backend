using Microsoft.AspNetCore.Mvc;
using SGN.Domain.Interfaces;

namespace SGN_Backend.Controllers;

[Route("api/categories")]
[ApiController]
public class CategoriesController : ControllerBase
{
    private readonly ICategoryRepository _categoryRepo;

    public CategoriesController(ICategoryRepository categoryRepo)
    {
        _categoryRepo = categoryRepo;
    }

    [HttpGet]
    public async Task<IActionResult> GetCategories()
    {
        var categories = await _categoryRepo.GetAllAsync();
        var result = categories
            .OrderBy(c => c.CategoryName)
            .Select(c => new
            {
                c.CategoryId,
                c.CategoryName
            });

        return Ok(result);
    }
}
