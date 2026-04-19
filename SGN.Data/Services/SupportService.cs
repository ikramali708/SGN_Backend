using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using SGN.Core.Interfaces;
using SGN.Core.Models;
using SGN.Data.Context;
using SGN.Domain.Entities;

namespace SGN.Data.Services;

public class SupportService : ISupportService
{
    private static readonly string[] AllowedStatuses = ["Open", "InProgress", "Resolved"];

    private readonly NurseryDbContext _db;
    private readonly ILogger<SupportService> _logger;

    public SupportService(NurseryDbContext db, ILogger<SupportService> logger)
    {
        _db = db;
        _logger = logger;
    }

    public async Task<(bool Success, int StatusCode, object Response)> CreateTicketAsync(int userId, CreateTicketDto dto)
    {
        try
        {
            var validation = ValidateText(dto.Subject, "Subject", maxLen: 250);
            if (validation != null) return (false, 400, new { message = validation });
            validation = ValidateText(dto.Message, "Message", maxLen: 4000);
            if (validation != null) return (false, 400, new { message = validation });

            if (dto.OrderId is int oid)
            {
                var orderOk = await _db.Orders.AsNoTracking()
                    .AnyAsync(o => o.OrderId == oid && o.CustomerId == userId);
                if (!orderOk)
                    return (false, 400, new { message = "Order not found or does not belong to your account." });
            }

            var ticket = new SupportTicket
            {
                UserId = userId,
                Subject = dto.Subject.Trim(),
                Message = dto.Message.Trim(),
                OrderId = dto.OrderId,
                Status = "Open",
                CreatedAt = DateTime.Now
            };
            _db.SupportTickets.Add(ticket);
            await _db.SaveChangesAsync();

            return (true, 200, MapSummary(ticket));
        }
        catch (Exception ex)
        {
            return HandleException(ex, nameof(CreateTicketAsync));
        }
    }

    public async Task<(bool Success, int StatusCode, object Response)> GetMyTicketsAsync(int userId)
    {
        try
        {
            var list = await _db.SupportTickets.AsNoTracking()
                .Where(t => t.UserId == userId)
                .OrderByDescending(t => t.CreatedAt)
                .Select(t => new SupportTicketSummaryDto
                {
                    Id = t.Id,
                    UserId = t.UserId,
                    Subject = t.Subject,
                    Status = t.Status,
                    OrderId = t.OrderId,
                    CreatedAt = t.CreatedAt
                })
                .ToListAsync();
            return (true, 200, list);
        }
        catch (Exception ex)
        {
            return HandleException(ex, nameof(GetMyTicketsAsync));
        }
    }

    public async Task<(bool Success, int StatusCode, object Response)> GetMyTicketByIdAsync(int userId, int ticketId)
    {
        try
        {
            var ticket = await _db.SupportTickets.AsNoTracking()
                .Include(t => t.Replies)
                .FirstOrDefaultAsync(t => t.Id == ticketId);
            if (ticket == null)
                return (false, 404, new { message = "Ticket not found." });
            if (ticket.UserId != userId)
                return (false, 404, new { message = "Ticket not found." });

            return (true, 200, MapCustomerDetail(ticket));
        }
        catch (Exception ex)
        {
            return HandleException(ex, nameof(GetMyTicketByIdAsync));
        }
    }

    public async Task<(bool Success, int StatusCode, object Response)> ReplyAsCustomerAsync(int userId, int ticketId, ReplyDto dto)
    {
        try
        {
            var msgErr = ValidateText(dto.Message, "Message", maxLen: 4000);
            if (msgErr != null) return (false, 400, new { message = msgErr });

            var ticket = await _db.SupportTickets.FirstOrDefaultAsync(t => t.Id == ticketId);
            if (ticket == null || ticket.UserId != userId)
                return (false, 404, new { message = "Ticket not found." });

            _db.SupportReplies.Add(new SupportReply
            {
                TicketId = ticket.Id,
                SenderRole = "Customer",
                Message = dto.Message.Trim(),
                CreatedAt = DateTime.Now
            });
            await _db.SaveChangesAsync();

            var refreshed = await LoadTicketWithRepliesAsync(ticket.Id);
            return (true, 200, MapCustomerDetail(refreshed!));
        }
        catch (Exception ex)
        {
            return HandleException(ex, nameof(ReplyAsCustomerAsync));
        }
    }

    public async Task<(bool Success, int StatusCode, object Response)> GetAllTicketsForAdminAsync(string? statusFilter)
    {
        try
        {
            string? normalized = null;
            if (!string.IsNullOrWhiteSpace(statusFilter))
            {
                normalized = NormalizeStatus(statusFilter);
                if (normalized == null)
                    return (false, 400, new { message = $"Invalid status. Use one of: {string.Join(", ", AllowedStatuses)}." });
            }

            // Explicit join avoids Include+Select translation edge cases and keeps SQL predictable.
            var query =
                from t in _db.SupportTickets.AsNoTracking()
                join u in _db.Users.AsNoTracking() on t.UserId equals u.UserId into userGroup
                from u in userGroup.DefaultIfEmpty()
                select new { Ticket = t, User = u };

            if (normalized != null)
                query = query.Where(x => x.Ticket.Status == normalized);

            var list = await query
                .OrderByDescending(x => x.Ticket.CreatedAt)
                .Select(x => new AdminSupportTicketSummaryDto
                {
                    Id = x.Ticket.Id,
                    UserId = x.Ticket.UserId,
                    Subject = x.Ticket.Subject,
                    Status = x.Ticket.Status,
                    OrderId = x.Ticket.OrderId,
                    CreatedAt = x.Ticket.CreatedAt,
                    CustomerName = x.User != null ? x.User.Name : null,
                    CustomerEmail = x.User != null ? x.User.Email : null
                })
                .ToListAsync();

            return (true, 200, list);
        }
        catch (Exception ex)
        {
            return HandleException(ex, nameof(GetAllTicketsForAdminAsync));
        }
    }

    public async Task<(bool Success, int StatusCode, object Response)> UpdateTicketStatusForAdminAsync(int ticketId, UpdateTicketStatusDto dto)
    {
        try
        {
            var normalized = NormalizeStatus(dto.Status);
            if (normalized == null)
                return (false, 400, new { message = $"Status must be one of: {string.Join(", ", AllowedStatuses)}." });

            var ticket = await _db.SupportTickets.FirstOrDefaultAsync(t => t.Id == ticketId);
            if (ticket == null)
                return (false, 404, new { message = "Ticket not found." });

            ticket.Status = normalized;
            await _db.SaveChangesAsync();
            return (true, 200, new { message = "Status updated.", ticketId = ticket.Id, status = ticket.Status });
        }
        catch (Exception ex)
        {
            return HandleException(ex, nameof(UpdateTicketStatusForAdminAsync));
        }
    }

    public async Task<(bool Success, int StatusCode, object Response)> ReplyAsAdminAsync(int ticketId, ReplyDto dto)
    {
        try
        {
            var msgErr = ValidateText(dto.Message, "Message", maxLen: 4000);
            if (msgErr != null) return (false, 400, new { message = msgErr });

            var ticket = await _db.SupportTickets.FirstOrDefaultAsync(t => t.Id == ticketId);
            if (ticket == null)
                return (false, 404, new { message = "Ticket not found." });

            if (string.Equals(ticket.Status, "Open", StringComparison.OrdinalIgnoreCase))
                ticket.Status = "InProgress";

            _db.SupportReplies.Add(new SupportReply
            {
                TicketId = ticket.Id,
                SenderRole = "Admin",
                Message = dto.Message.Trim(),
                CreatedAt = DateTime.Now
            });
            await _db.SaveChangesAsync();

            var refreshed = await LoadTicketForAdminAsync(ticket.Id);
            return (true, 200, refreshed!);
        }
        catch (Exception ex)
        {
            return HandleException(ex, nameof(ReplyAsAdminAsync));
        }
    }

    public async Task<(bool Success, int StatusCode, object Response)> GetTicketForAdminAsync(int ticketId)
    {
        try
        {
            var detail = await LoadTicketForAdminAsync(ticketId);
            if (detail == null)
                return (false, 404, new { message = "Ticket not found." });
            return (true, 200, detail);
        }
        catch (Exception ex)
        {
            return HandleException(ex, nameof(GetTicketForAdminAsync));
        }
    }

    private (bool Success, int StatusCode, object Response) HandleException(Exception ex, string operation)
    {
        _logger.LogError(ex, "SupportService.{Operation} failed: {Message}", operation, ex.Message);

        var sql = FindSqlException(ex);
        if (sql != null && (sql.Number == 208 || sql.Message.Contains("SupportTickets", StringComparison.OrdinalIgnoreCase) || sql.Message.Contains("SupportReplies", StringComparison.OrdinalIgnoreCase)))
        {
            return (false, 503, new
            {
                message = "Support ticketing storage is not available (tables missing or outdated). Apply EF Core migrations from the solution root: dotnet ef database update --project SGN.Data --startup-project SGN-Backend/SGN-Backend.csproj"
            });
        }

        return (false, 503, new { message = "Support request could not be completed due to a data error. Details have been logged on the server." });
    }

    private static SqlException? FindSqlException(Exception? ex)
    {
        while (ex != null)
        {
            if (ex is SqlException sql)
                return sql;
            ex = ex.InnerException;
        }

        return null;
    }

    private async Task<SupportTicket?> LoadTicketWithRepliesAsync(int ticketId)
    {
        return await _db.SupportTickets
            .Include(t => t.Replies)
            .FirstOrDefaultAsync(t => t.Id == ticketId);
    }

    private async Task<AdminSupportTicketDetailDto?> LoadTicketForAdminAsync(int ticketId)
    {
        var ticket = await _db.SupportTickets.AsNoTracking()
            .Include(t => t.User)
            .Include(t => t.Replies)
            .FirstOrDefaultAsync(t => t.Id == ticketId);
        if (ticket == null) return null;

        return new AdminSupportTicketDetailDto
        {
            Id = ticket.Id,
            UserId = ticket.UserId,
            Subject = ticket.Subject,
            Message = ticket.Message,
            OrderId = ticket.OrderId,
            Status = ticket.Status,
            CreatedAt = ticket.CreatedAt,
            CustomerName = ticket.User?.Name,
            CustomerEmail = ticket.User?.Email,
            Replies = MapReplies(ticket.Replies)
        };
    }

    private static SupportTicketDetailDto MapCustomerDetail(SupportTicket ticket)
    {
        return new SupportTicketDetailDto
        {
            Id = ticket.Id,
            UserId = ticket.UserId,
            Subject = ticket.Subject,
            Message = ticket.Message,
            OrderId = ticket.OrderId,
            Status = ticket.Status,
            CreatedAt = ticket.CreatedAt,
            Replies = MapReplies(ticket.Replies)
        };
    }

    private static List<SupportReplyItemDto> MapReplies(IEnumerable<SupportReply>? replies)
    {
        return (replies ?? Enumerable.Empty<SupportReply>())
            .OrderBy(r => r.CreatedAt)
            .Select(r => new SupportReplyItemDto
            {
                Id = r.Id,
                SenderRole = r.SenderRole,
                Message = r.Message,
                CreatedAt = r.CreatedAt
            })
            .ToList();
    }

    private static SupportTicketSummaryDto MapSummary(SupportTicket t)
    {
        return new SupportTicketSummaryDto
        {
            Id = t.Id,
            UserId = t.UserId,
            Subject = t.Subject,
            Status = t.Status,
            OrderId = t.OrderId,
            CreatedAt = t.CreatedAt
        };
    }

    private static string? ValidateText(string value, string fieldName, int maxLen)
    {
        if (string.IsNullOrWhiteSpace(value))
            return $"{fieldName} is required.";
        if (value.Length > maxLen)
            return $"{fieldName} must be at most {maxLen} characters.";
        return null;
    }

    private static string? NormalizeStatus(string status)
    {
        if (string.IsNullOrWhiteSpace(status)) return null;
        return AllowedStatuses.FirstOrDefault(s =>
            string.Equals(s, status.Trim(), StringComparison.OrdinalIgnoreCase));
    }
}
