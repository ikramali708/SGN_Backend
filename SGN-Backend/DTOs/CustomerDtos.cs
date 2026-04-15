namespace SGN_Backend.DTOs;

public sealed class CustomerRegisterDto
{
    public string Name { get; set; } = null!;
    public string Email { get; set; } = null!;
    public string Password { get; set; } = null!;
    public string Phone { get; set; } = null!;
}

public sealed class CustomerLoginDto
{
    public string Email { get; set; } = null!;
    public string Password { get; set; } = null!;
}

public sealed class CustomerProfileUpdateDto
{
    public string Name { get; set; } = null!;
    public string Phone { get; set; } = null!;
}

public sealed class CustomerChangePasswordDto
{
    public string OldPassword { get; set; } = null!;
    public string NewPassword { get; set; } = null!;
}

public sealed class CustomerOrderCreateDto
{
    public string ShippingAddress { get; set; } = null!;
    public List<CustomerOrderItemCreateDto> OrderItems { get; set; } = new();
}

public sealed class CustomerOrderItemCreateDto
{
    public int PlantId { get; set; }
    public int Quantity { get; set; }
}

public sealed class CustomerMessageDto
{
    public string Message { get; set; } = null!;
}

public sealed class CustomerLoginResponseDto
{
    public string Token { get; set; } = null!;
    public int UserId { get; set; }
    public string Role { get; set; } = null!;
}

public sealed class CustomerProfileDto
{
    public int UserId { get; set; }
    public string Name { get; set; } = null!;
    public string Email { get; set; } = null!;
    public string Phone { get; set; } = null!;
    public string Status { get; set; } = null!;
    public string Role { get; set; } = null!;
}

public sealed class CustomerOrderItemResponseDto
{
    public int PlantId { get; set; }
    public int Quantity { get; set; }
    public decimal PriceAtTime { get; set; }
}

public sealed class CustomerOrderResponseDto
{
    public int OrderId { get; set; }
    public int CustomerId { get; set; }
    public decimal TotalAmount { get; set; }
    public string OrderStatus { get; set; } = null!;
    public string PaymentStatus { get; set; } = null!;
    public string ShippingAddress { get; set; } = null!;
    public DateTime OrderDate { get; set; }
    public List<CustomerOrderItemResponseDto> OrderItems { get; set; } = new();
}

public class CustomerPlantListItemDto
{
    public int PlantId { get; set; }
    public string PlantName { get; set; } = null!;
    public string? Description { get; set; }
    public decimal Price { get; set; }
    public string? ImageUrl { get; set; }
    public string? NurseryName { get; set; }
    public string? CategoryName { get; set; }
}

public sealed class CustomerPlantDetailDto : CustomerPlantListItemDto
{
    public int StockQuantity { get; set; }
    public string? Status { get; set; }
    public DateTime CreatedAt { get; set; }
}
