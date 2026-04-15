using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
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

    public NurseryInventoryController(IPlantRepository plantRepo, ICategoryRepository categoryRepo)
    {
        _plantRepo = plantRepo;
        _categoryRepo = categoryRepo;
    }

    [HttpGet]
    public async Task<IActionResult> GetInventory()
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

    [HttpPut("update-stock/{plantId:int}")]
    public async Task<IActionResult> UpdateStock(int plantId, [FromBody] UpdateStockDto dto)
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

        return Ok(plant);
    }

    private bool TryGetNurseryId(out int nurseryId)
    {
        var claimValue = User.FindFirstValue(ClaimTypes.NameIdentifier);
        return int.TryParse(claimValue, out nurseryId);
    }
}
