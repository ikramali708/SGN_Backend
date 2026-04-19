namespace SGN.Domain.Entities;

public class SupportReply
{
    public int Id { get; set; }
    public int TicketId { get; set; }
    public string SenderRole { get; set; } = null!;
    public string Message { get; set; } = null!;
    public DateTime CreatedAt { get; set; } = DateTime.Now;

    public SupportTicket? Ticket { get; set; }
}
