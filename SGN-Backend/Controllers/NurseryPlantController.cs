using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SGN.Domain.Entities;
using SGN.Domain.Interfaces;
using SGN_Backend.DTOs;
using System.Security.Claims;

namespace SGN_Backend.Controllers;

[Route("api/nursery/plants")]
[ApiController]
[Authorize(Roles = "NurseryOwner")]
[ApiExplorerSettings(GroupName = "NURSERY")]
[Tags("Nursery Plants")]
public class NurseryPlantController : ControllerBase
{
    private readonly IPlantRepository _plantRepo;
    private readonly ICategoryRepository _categoryRepo;
    private readonly IWebHostEnvironment _env;

    public NurseryPlantController(
        IPlantRepository plantRepo,
        ICategoryRepository categoryRepo,
        IWebHostEnvironment env)
    {
        _plantRepo = plantRepo;
        _categoryRepo = categoryRepo;
        _env = env;
    }

    [HttpGet]
    public async Task<IActionResult> GetMyPlants()
    {
        if (!TryGetNurseryId(out var nurseryId))
            return Unauthorized("Invalid nursery token.");

        var plants = await _plantRepo.GetAllAsync();
        var result = plants
            .Where(p => p.NurseryId == nurseryId)
            .OrderByDescending(p => p.CreatedAt)
            .ToList();

        return Ok(result);
    }

    [HttpPost]
    [Consumes("multipart/form-data")]
    public async Task<IActionResult> CreatePlant([FromForm] CreatePlantDto dto)
    {
        try
        {
            if (!TryGetNurseryId(out var nurseryId))
                return Unauthorized("Invalid nursery token.");

            if (dto.Image == null || dto.Image.Length == 0)
                return BadRequest("Image is required");

            var category = await _categoryRepo.GetByIdAsync(dto.CategoryId);
            if (category == null)
                return BadRequest("Invalid CategoryId.");

            var imagePath = await SaveImageAsync(dto.Image);

            var plant = new Plant
            {
                NurseryId = nurseryId,
                CategoryId = dto.CategoryId,
                PlantName = dto.PlantName,
                Description = dto.Description,
                Price = dto.Price,
                StockQuantity = dto.StockQuantity,
                ImageUrl = imagePath,
                Status = dto.Status,
                CreatedAt = DateTime.Now
            };

            var created = await _plantRepo.AddAsync(plant);
            return CreatedAtAction(nameof(GetMyPlants), new { id = created.PlantId }, created);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new
            {
                message = "Failed to create plant.",
                error = ex.Message
            });
        }
    }

    [HttpPut("{id:int}")]
    [Consumes("multipart/form-data")]
    public async Task<IActionResult> UpdatePlant(int id, [FromForm] CreatePlantDto dto)
    {
        if (!TryGetNurseryId(out var nurseryId))
            return Unauthorized("Invalid nursery token.");

        var plant = await _plantRepo.GetByIdAsync(id);
        if (plant == null)
            return NotFound("Plant not found.");

        if (plant.NurseryId != nurseryId)
            return Unauthorized("You can only modify your own plants.");

        var category = await _categoryRepo.GetByIdAsync(dto.CategoryId);
        if (category == null)
            return BadRequest("Invalid CategoryId.");

        var imagePath = await SaveImageAsync(dto.Image);

        plant.CategoryId = dto.CategoryId;
        plant.PlantName = dto.PlantName;
        plant.Description = dto.Description;
        plant.Price = dto.Price;
        plant.StockQuantity = dto.StockQuantity;
        if (!string.IsNullOrWhiteSpace(imagePath))
        {
            plant.ImageUrl = imagePath;
        }
        plant.Status = dto.Status;

        await _plantRepo.UpdateAsync(plant);
        return Ok(plant);
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> DeletePlant(int id)
    {
        if (!TryGetNurseryId(out var nurseryId))
            return Unauthorized("Invalid nursery token.");

        var plant = await _plantRepo.GetByIdAsync(id);
        if (plant == null)
            return NotFound("Plant not found.");

        if (plant.NurseryId != nurseryId)
            return Unauthorized("You can only delete your own plants.");

        await _plantRepo.DeleteAsync(id);
        return Ok(new { message = "Plant deleted successfully." });
    }

    private bool TryGetNurseryId(out int nurseryId)
    {
        var claimValue = User.FindFirstValue(ClaimTypes.NameIdentifier);
        return int.TryParse(claimValue, out nurseryId);
    }

    private async Task<string?> SaveImageAsync(IFormFile? image)
    {
        if (image == null || image.Length == 0) return null;

        var extension = Path.GetExtension(image.FileName);
        var fileName = $"{Guid.NewGuid()}{extension}";
        var folderPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads", "plants");
        if (!Directory.Exists(folderPath))
            Directory.CreateDirectory(folderPath);

        var filePath = Path.Combine(folderPath, fileName);
        await using (var stream = new FileStream(filePath, FileMode.Create))
        {
            await image.CopyToAsync(stream);
        }

        return $"/uploads/plants/{fileName}";
    }
}
