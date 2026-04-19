namespace SGN.Domain.Entities;

public class SupportTicket
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public string Subject { get; set; } = null!;
    public string Message { get; set; } = null!;
    public int? OrderId { get; set; }
    public string Status { get; set; } = "Open";
    public DateTime CreatedAt { get; set; } = DateTime.Now;

    public User? User { get; set; }
    public Order? Order { get; set; }
    public ICollection<SupportReply>? Replies { get; set; }
}
