using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SGN.Data.Context;
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
    private readonly NurseryDbContext _context;

    public AdminPlantsController(IPlantRepository plantRepo, NurseryDbContext context)
    {
        _plantRepo = plantRepo;
        _context = context;
    }

    /// <summary>
    /// List plants with optional category filter, search, and pagination
    /// </summary>
    /// <param name="search">Matches plant name or description</param>
    /// <param name="categoryId">Filter by category</param>
    /// <param name="page">1-based page index</param>
    /// <param name="pageSize">Items per page (max 100)</param>
    [HttpGet]
    public async Task<ActionResult<PagedResultDto<AdminPlantListItemDto>>> GetPlants(
        [FromQuery] string? search,
        [FromQuery] int? categoryId,
        [FromQuery] int? page,
        [FromQuery] int? pageSize)
    {
        var all = await _context.Plants
            .AsNoTracking()
            .Select(p => new AdminPlantListItemDto(
                p.PlantId,
                p.NurseryId,
                p.CategoryId,
                p.PlantName,
                p.Description,
                p.Price,
                p.StockQuantity,
                p.ImageUrl,
                p.Status,
                p.CreatedAt,
                p.Nursery != null ? p.Nursery.NurseryName : null,
                p.Category != null ? p.Category.CategoryName : null))
            .ToListAsync();

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
    /// Delete plant by id.
    /// </summary>
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var plant = await _plantRepo.GetByIdAsync(id);
        if (plant == null)
            return NotFound(new { message = "Plant not found." });

        await _plantRepo.DeleteAsync(id);
        return Ok(new { message = "Plant deleted successfully.", plantId = id });
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
