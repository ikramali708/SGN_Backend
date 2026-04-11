using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SGN.Domain.Entities;
using SGN.Domain.Interfaces;
using SGN_Backend.DTOs;
using SGN_Backend.Helpers;

namespace SGN_Backend.Controllers;

/// <summary>
/// Admin plant catalog management.
/// </summary>
[Route("api/admin/plants")]
[ApiController]
[Authorize(Roles = "Admin")]
[ApiExplorerSettings(GroupName = "ADMIN")]
[Tags("Admin Plants")]
public class AdminPlantsController : ControllerBase
{
    private readonly IPlantRepository _plantRepo;

    public AdminPlantsController(IPlantRepository plantRepo)
    {
        _plantRepo = plantRepo;
    }

    /// <summary>
    /// List plants with optional category filter, search, and pagination
    /// </summary>
    /// <param name="search">Matches plant name or description</param>
    /// <param name="categoryId">Filter by category</param>
    /// <param name="page">1-based page index</param>
    /// <param name="pageSize">Items per page (max 100)</param>
    [HttpGet]
    public async Task<ActionResult<PagedResultDto<Plant>>> GetPlants(
        [FromQuery] string? search,
        [FromQuery] int? categoryId,
        [FromQuery] int? page,
        [FromQuery] int? pageSize)
    {
        var all = (await _plantRepo.GetAllAsync()).ToList();

        if (categoryId.HasValue)
            all = all.Where(p => p.CategoryId == categoryId.Value).ToList();

        if (!string.IsNullOrWhiteSpace(search))
        {
            var s = search.Trim();
            all = all.Where(p =>
                    p.PlantName.Contains(s, StringComparison.OrdinalIgnoreCase) ||
                    (p.Description != null && p.Description.Contains(s, StringComparison.OrdinalIgnoreCase)))
                .ToList();
        }

        var total = all.Count;
        var (p, ps) = AdminListHelper.NormalizePage(page, pageSize);
        var items = all
            .OrderByDescending(x => x.CreatedAt)
            .Skip((p - 1) * ps)
            .Take(ps)
            .ToList();

        return Ok(AdminListHelper.ToPagedResult(items, p, ps, total));
    }

    /// <summary>
    /// Get plant details by id
    /// </summary>
    [HttpGet("{id:int}")]
    [ProducesResponseType(typeof(Plant), 200)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> GetById(int id)
    {
        var plant = await _plantRepo.GetByIdAsync(id);
        if (plant == null)
            return NotFound("Plant not found");
        return Ok(plant);
    }
}
