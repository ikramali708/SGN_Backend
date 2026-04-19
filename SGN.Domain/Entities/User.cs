namespace SGN.Domain.Entities;

public class User
{
    public int UserId { get; set; }
    public string Name { get; set; } = null!;
    public string Email { get; set; } = null!;
    public string Password { get; set; } = null!;
    public string Phone { get; set; } = null!;
    public string Status { get; set; } = "Active"; // Active/Inactive
    public string Role { get; set; } = "Customer"; // Customer, NurseryOwner, Admin
    public DateTime CreatedAt { get; set; } = DateTime.Now;

    // Navigation
    public ICollection<Order>? Orders { get; set; }
    public ICollection<ContactMessage>? ContactMessages { get; set; }
    public ICollection<SupportTicket>? SupportTickets { get; set; }
}