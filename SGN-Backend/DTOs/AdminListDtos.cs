namespace SGN_Backend.DTOs;

public record AdminUserListItemDto(
    int UserId,
    string Name,
    string Email,
    string Phone,
    string Status,
    string Role,
    DateTime CreatedAt);

public record AdminNurseryListItemDto(
    int NurseryId,
    string NurseryName,
    string OwnerName,
    string Email,
    string Phone,
    string Address,
    string City,
    int TotalPlants,
    string ApprovalStatus,
    string Status,
    DateTime CreatedAt);

public record AdminPlantListItemDto(
    int PlantId,
    int NurseryId,
    int CategoryId,
    string PlantName,
    string? Description,
    decimal Price,
    int StockQuantity,
    string? ImageUrl,
    string Status,
    DateTime CreatedAt,
    string? NurseryName,
    string? CategoryName);

public record AdminOrderListItemDto(
    int OrderId,
    int CustomerId,
    DateTime OrderDate,
    decimal TotalAmount,
    string OrderStatus,
    string PaymentStatus,
    string ShippingAddress,
    string? Country,
    string? Province,
    string? City,
    string? FullAddress,
    string? PhoneNumber,
    string? Comment,
    string? CancellationReason,
    string? NurseryName,
    string? CustomerName,
    int Quantity);
