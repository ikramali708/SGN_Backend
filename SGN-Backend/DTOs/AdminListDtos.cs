namespace SGN_Backend.DTOs;

public record AdminUserListItemDto(
    int UserId,
    string Name,
    string Email,
    string Phone,
    string Status,
    string Role,
    DateTime CreatedAt);

public record AdminNurseryListItemDto(
    int NurseryId,
    string NurseryName,
    string OwnerName,
    string Email,
    string Phone,
    string Address,
    string City,
    string ApprovalStatus,
    string Status,
    DateTime CreatedAt);
