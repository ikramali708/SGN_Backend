

namespace SGN.Domain.Entities;

public class OrderItem
{
    public int OrderItemId { get; set; }
    public int OrderId { get; set; }
    public int PlantId { get; set; }
    public int Quantity { get; set; }
    public decimal PriceAtTime { get; set; }

    // Navigation
    public Order? Order { get; set; }
    public Plant? Plant { get; set; }
}