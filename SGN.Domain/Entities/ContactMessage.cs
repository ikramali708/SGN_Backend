

namespace SGN.Domain.Entities;

public class ContactMessage
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public string Name { get; set; } = null!;
    public string Email { get; set; } = null!;
    public string Subject { get; set; } = null!;
    public string Message { get; set; } = null!;
    public string Status { get; set; } = "Pending"; // Pending, Read, Resolved
    public DateTime CreatedAt { get; set; } = DateTime.Now;

    // Navigation
    public User? User { get; set; }
}