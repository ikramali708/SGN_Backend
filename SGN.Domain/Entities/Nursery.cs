namespace SGN.Domain.Entities;

public class Nursery
{
    public int NurseryId { get; set; }
    public string NurseryName { get; set; } = null!;
    public string OwnerName { get; set; } = null!;
    public string Email { get; set; } = null!;
    public string Password { get; set; } = null!;
    public string Phone { get; set; } = null!;
    public string Address { get; set; } = null!;
    public string City { get; set; } = null!;
    public string ApprovalStatus { get; set; } = "Pending"; // Pending, Approved, Rejected
    public string Status { get; set; } = "Active";
    public DateTime CreatedAt { get; set; } = DateTime.Now;

    // Navigation
    public ICollection<Plant>? Plants { get; set; }
}