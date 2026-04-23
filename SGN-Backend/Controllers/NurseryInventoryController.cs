using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using SGN.Domain.Interfaces;
using SGN_Backend.DTOs;
using System.Security.Claims;

namespace SGN_Backend.Controllers;

[Route("api/nursery/inventory")]
[ApiController]
[Authorize(Roles = "NurseryOwner")]
[ApiExplorerSettings(GroupName = "NURSERY")]
[Tags("Nursery Inventory")]
public class NurseryInventoryController : ControllerBase
{
    private readonly IPlantRepository _plantRepo;
    private readonly ICategoryRepository _categoryRepo;
    private readonly ILogger<NurseryInventoryController> _logger;

    public NurseryInventoryController(IPlantRepository plantRepo, ICategoryRepository categoryRepo, ILogger<NurseryInventoryController> logger)
    {
        _plantRepo = plantRepo;
        _categoryRepo = categoryRepo;
        _logger = logger;
    }

    [HttpGet]
    public async Task<IActionResult> GetInventory()
    {
        try
        {
            if (!TryGetNurseryId(out var nurseryId))
                return Unauthorized("Invalid nursery token.");

            var plants = await _plantRepo.GetAllAsync();
            var categories = await _categoryRepo.GetAllAsync();
            var categoryMap = categories.ToDictionary(c => c.CategoryId, c => c.CategoryName);

            var response = plants
                .Where(p => p.NurseryId == nurseryId)
                .OrderBy(p => p.PlantName)
                .Select(p => new InventoryResponseDto(
                    PlantId: p.PlantId,
                    PlantName: p.PlantName,
                    CategoryName: categoryMap.TryGetValue(p.CategoryId, out var categoryName) ? categoryName : "Unknown",
                    StockQuantity: p.StockQuantity,
                    Price: p.Price))
                .ToList();

            return Ok(response);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to load inventory.");
            return StatusCode(500, new { message = "Failed to load inventory." });
        }
    }

    [HttpPut("update-stock/{plantId:int}")]
    public async Task<IActionResult> UpdateStock(int plantId, [FromBody] UpdateStockDto dto)
    {
        return await UpdateStockCore(plantId, dto);
    }

    [HttpPatch("{plantId:int}")]
    public async Task<IActionResult> UpdateStockLegacy(int plantId, [FromBody] UpdateStockDto dto)
    {
        return await UpdateStockCore(plantId, dto);
    }

    private async Task<IActionResult> UpdateStockCore(int plantId, UpdateStockDto dto)
    {
        try
        {
            if (!TryGetNurseryId(out var nurseryId))
                return Unauthorized("Invalid nursery token.");

            if (dto.StockQuantity < 0)
                return BadRequest("Stock quantity cannot be negative.");

            var plant = await _plantRepo.GetByIdAsync(plantId);
            if (plant == null)
                return NotFound("Plant not found.");

            if (plant.NurseryId != nurseryId)
                return Unauthorized("You can only update stock for your own plants.");

            plant.StockQuantity = dto.StockQuantity;
            await _plantRepo.UpdateAsync(plant);

            return Ok(new { message = "Stock updated successfully.", plant });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to update stock for plant id {PlantId}.", plantId);
            return StatusCode(500, new { message = "Failed to update stock." });
        }
    }

    private bool TryGetNurseryId(out int nurseryId)
    {
        var claimValue = User.FindFirstValue(ClaimTypes.NameIdentifier);
        return int.TryParse(claimValue, out nurseryId);
    }
}
