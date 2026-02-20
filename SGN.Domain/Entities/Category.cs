namespace SGN.Domain.Entities;

public class Category
{
    public int CategoryId { get; set; }
    public string CategoryName { get; set; } = null!;
    public DateTime CreatedAt { get; set; } = DateTime.Now;

    // Navigation
    public ICollection<Plant>? Plants { get; set; }
}