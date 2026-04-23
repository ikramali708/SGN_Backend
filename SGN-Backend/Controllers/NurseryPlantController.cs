using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using SGN.Data.Context;
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
    private readonly NurseryDbContext _dbContext;
    private readonly IWebHostEnvironment _env;
    private readonly ILogger<NurseryPlantController> _logger;

    public NurseryPlantController(
        IPlantRepository plantRepo,
        ICategoryRepository categoryRepo,
        NurseryDbContext dbContext,
        IWebHostEnvironment env,
        ILogger<NurseryPlantController> logger)
    {
        _plantRepo = plantRepo;
        _categoryRepo = categoryRepo;
        _dbContext = dbContext;
        _env = env;
        _logger = logger;
    }

    [HttpGet]
    public async Task<IActionResult> GetMyPlants()
    {
        try
        {
            if (!TryGetNurseryId(out var nurseryId))
                return Unauthorized("Invalid nursery token.");

            var plants = await _plantRepo.GetAllAsync();
            var categories = await _categoryRepo.GetAllAsync();
            var categoryMap = categories.ToDictionary(c => c.CategoryId, c => c.CategoryName);

            var result = plants
                .Where(p => p.NurseryId == nurseryId)
                .OrderByDescending(p => p.CreatedAt)
                .Select(p => new
                {
                    p.PlantId,
                    p.NurseryId,
                    p.CategoryId,
                    CategoryName = categoryMap.TryGetValue(p.CategoryId, out var categoryName) ? categoryName : null,
                    p.PlantName,
                    p.Description,
                    p.Price,
                    p.StockQuantity,
                    p.ImageUrl,
                    p.Status,
                    p.CreatedAt
                })
                .ToList();

            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to load nursery plants.");
            return StatusCode(500, new { message = "Failed to load nursery plants." });
        }
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
        try
        {
            if (!TryGetNurseryId(out var nurseryId))
                return Unauthorized("Invalid nursery token.");

            var existingPlant = await _plantRepo.GetByIdAsync(id);

            if (existingPlant == null)
                return NotFound("Plant not found.");

            if (existingPlant.NurseryId != nurseryId)
                return Unauthorized("You can only modify your own plants.");

            if (dto.CategoryId <= 0)
                return BadRequest("CategoryId is required.");
            if (string.IsNullOrWhiteSpace(dto.PlantName))
                return BadRequest("PlantName is required.");
            if (dto.Price <= 0)
                return BadRequest("Price must be greater than zero.");
            if (dto.StockQuantity < 0)
                return BadRequest("Stock quantity cannot be negative.");

            var category = await _categoryRepo.GetByIdAsync(dto.CategoryId);
            if (category == null)
                return BadRequest("Invalid CategoryId.");

            _logger.LogInformation(
                "UpdatePlant image phase. PlantId: {PlantId}, HasImage: {HasImage}, FileName: {FileName}, FileSize: {FileSize}",
                id,
                dto.Image != null,
                dto.Image?.FileName,
                dto.Image?.Length);

            var imagePath = await SaveImageAsync(dto.Image);

            existingPlant.CategoryId = dto.CategoryId;
            existingPlant.PlantName = dto.PlantName.Trim();
            existingPlant.Description = dto.Description?.Trim();
            existingPlant.Price = dto.Price;
            existingPlant.StockQuantity = dto.StockQuantity;
            if (!string.IsNullOrWhiteSpace(imagePath))
            {
                existingPlant.ImageUrl = imagePath;
            }
            existingPlant.Status = string.IsNullOrWhiteSpace(dto.Status) ? existingPlant.Status : dto.Status;

            _logger.LogInformation(
                "Before SaveChanges. PlantId: {PlantId}, CategoryId: {CategoryId}, ImageUrl: {ImageUrl}",
                existingPlant.PlantId,
                existingPlant.CategoryId,
                existingPlant.ImageUrl);

            var beforeState = _dbContext.Entry(existingPlant).State;
            _logger.LogInformation("Repository update phase (before). PlantId: {PlantId}, TrackingState: {TrackingState}", existingPlant.PlantId, beforeState);

            await _plantRepo.UpdateAsync(existingPlant);

            var afterState = _dbContext.Entry(existingPlant).State;
            _logger.LogInformation("Repository update phase (after). PlantId: {PlantId}, TrackingState: {TrackingState}", existingPlant.PlantId, afterState);

            return Ok(new
            {
                message = "Updated Successfully",
                plantId = existingPlant.PlantId
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "UpdatePlant failed for plant {PlantId}. Message: {Message}. Inner: {Inner}", id, ex.Message, ex.InnerException?.Message);
            return StatusCode(500, new
            {
                error = ex.Message,
                inner = ex.InnerException?.Message
            });
        }
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
