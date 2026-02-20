

namespace SGN.Domain.Entities;

public class Order
{
    public int OrderId { get; set; }
    public int CustomerId { get; set; } // UserId
    public DateTime OrderDate { get; set; } = DateTime.Now;
    public decimal TotalAmount { get; set; }
    public string OrderStatus { get; set; } = "Pending"; // Pending, Successful, Cancelled
    public string PaymentStatus { get; set; } = "COD";
    public string ShippingAddress { get; set; } = null!;
    public string? CancellationReason { get; set; }

    // Navigation
    public User? Customer { get; set; }
    public ICollection<OrderItem>? OrderItems { get; set; }
}