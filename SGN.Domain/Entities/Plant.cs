

namespace SGN.Domain.Entities;

public class Plant
{
    public int PlantId { get; set; }
    public int NurseryId { get; set; }
    public int CategoryId { get; set; }

    public string PlantName { get; set; } = null!;
    public string? Description { get; set; }
    public decimal Price { get; set; }
    public int StockQuantity { get; set; }
    public string? ImageUrl { get; set; }
    public string Status { get; set; } = "Active";
    public DateTime CreatedAt { get; set; } = DateTime.Now;

    // Navigation
    public Nursery? Nursery { get; set; }
    public Category? Category { get; set; }
    public ICollection<OrderItem>? OrderItems { get; set; }
}