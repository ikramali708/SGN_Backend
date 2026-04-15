namespace SGN_Backend.DTOs;

public sealed class NurseryOwnerSignupDto
{
    public string NurseryName { get; set; } = null!;
    public string OwnerName { get; set; } = null!;
    public string Email { get; set; } = null!;
    public string Password { get; set; } = null!;
}

public sealed class NurseryOwnerLoginDto
{
    public string Email { get; set; } = null!;
    public string Password { get; set; } = null!;
}

public sealed class CreatePlantDto
{
    public int CategoryId { get; set; }
    public string PlantName { get; set; } = null!;
    public string? Description { get; set; }
    public decimal Price { get; set; }
    public int StockQuantity { get; set; }
    public IFormFile? Image { get; set; }
    public string Status { get; set; } = "Active";
}

public sealed class UpdateStockDto
{
    public int StockQuantity { get; set; }
}

public sealed record InventoryResponseDto(
    int PlantId,
    string PlantName,
    string CategoryName,
    int StockQuantity,
    decimal Price
);

public sealed class NurseryOrderStatusUpdateDto
{
    public string Status { get; set; } = null!;
}

public sealed class NurseryProfileUpdateDto
{
    public string NurseryName { get; set; } = null!;
    public string OwnerName { get; set; } = null!;
    public string Email { get; set; } = null!;
}

public sealed record NurseryDashboardResponseDto(
    int TotalPlants,
    int TotalOrders,
    int CompletedOrders,
    int CancelledOrders,
    int PendingOrders,
    decimal TotalSales
);
