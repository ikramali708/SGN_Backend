using System.ComponentModel.DataAnnotations;

namespace SGN.Core.Models;

public sealed class CreateTicketDto
{
    [Required]
    [MaxLength(250)]
    public string Subject { get; set; } = null!;

    [Required]
    [MaxLength(4000)]
    public string Message { get; set; } = null!;

    public int? OrderId { get; set; }
}

public sealed class ReplyDto
{
    [Required]
    [MaxLength(4000)]
    public string Message { get; set; } = null!;
}

public sealed class UpdateTicketStatusDto
{
    [Required]
    [MaxLength(32)]
    public string Status { get; set; } = null!;
}

public class SupportTicketSummaryDto
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public string Subject { get; set; } = null!;
    public string Status { get; set; } = null!;
    public int? OrderId { get; set; }
    public DateTime CreatedAt { get; set; }
}

public sealed class AdminSupportTicketSummaryDto : SupportTicketSummaryDto
{
    public string? CustomerName { get; set; }
    public string? CustomerEmail { get; set; }
}

public sealed class SupportReplyItemDto
{
    public int Id { get; set; }
    public string SenderRole { get; set; } = null!;
    public string Message { get; set; } = null!;
    public DateTime CreatedAt { get; set; }
}

public class SupportTicketDetailDto
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public string Subject { get; set; } = null!;
    public string Message { get; set; } = null!;
    public int? OrderId { get; set; }
    public string Status { get; set; } = null!;
    public DateTime CreatedAt { get; set; }
    public List<SupportReplyItemDto> Replies { get; set; } = new();
}

public sealed class AdminSupportTicketDetailDto : SupportTicketDetailDto
{
    public string? CustomerName { get; set; }
    public string? CustomerEmail { get; set; }
}
