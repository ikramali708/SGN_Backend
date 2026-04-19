using SGN.Core.Models;

namespace SGN.Core.Interfaces;

public interface ISupportService
{
    Task<(bool Success, int StatusCode, object Response)> CreateTicketAsync(int userId, CreateTicketDto dto);
    Task<(bool Success, int StatusCode, object Response)> GetMyTicketsAsync(int userId);
    Task<(bool Success, int StatusCode, object Response)> GetMyTicketByIdAsync(int userId, int ticketId);
    Task<(bool Success, int StatusCode, object Response)> ReplyAsCustomerAsync(int userId, int ticketId, ReplyDto dto);

    Task<(bool Success, int StatusCode, object Response)> GetAllTicketsForAdminAsync(string? statusFilter);
    Task<(bool Success, int StatusCode, object Response)> UpdateTicketStatusForAdminAsync(int ticketId, UpdateTicketStatusDto dto);
    Task<(bool Success, int StatusCode, object Response)> ReplyAsAdminAsync(int ticketId, ReplyDto dto);
    Task<(bool Success, int StatusCode, object Response)> GetTicketForAdminAsync(int ticketId);
}
