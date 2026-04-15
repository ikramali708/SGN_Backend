using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SGN.Domain.Interfaces;
using SGN_Backend.DTOs;
using SGN_Backend.Helpers;

namespace SGN_Backend.Controllers;

/// <summary>
/// Admin user management.
/// </summary>
[Route("api/admin/users")]
[ApiController]
[Authorize(Roles = "Admin")]
[ApiExplorerSettings(GroupName = "ADMIN")]
[Tags("Admin Users")]
public class AdminUsersController : ControllerBase
{
    private readonly IUserRepository _userRepo;

    public AdminUsersController(IUserRepository userRepo)
    {
        _userRepo = userRepo;
    }

    /// <summary>
    /// Get registered users with optional search and pagination
    /// </summary>
    /// <param name="search">Matches name, email, or phone (case-insensitive)</param>
    /// <param name="page">1-based page index</param>
    /// <param name="pageSize">Items per page (max 100)</param>
    [HttpGet]
    public async Task<ActionResult<PagedResultDto<AdminUserListItemDto>>> GetUsers(
        [FromQuery] string? search,
        [FromQuery] int? page,
        [FromQuery] int? pageSize)
    {
        var all = (await _userRepo.GetAllAsync()).ToList();

        if (!string.IsNullOrWhiteSpace(search))
        {
            var s = search.Trim();
            all = all.Where(u =>
                    u.Name.Contains(s, StringComparison.OrdinalIgnoreCase) ||
                    u.Email.Contains(s, StringComparison.OrdinalIgnoreCase) ||
                    u.Phone.Contains(s, StringComparison.OrdinalIgnoreCase))
                .ToList();
        }

        var total = all.Count;
        var (p, ps) = AdminListHelper.NormalizePage(page, pageSize);
        var items = all
            .OrderByDescending(u => u.CreatedAt)
            .Skip((p - 1) * ps)
            .Take(ps)
            .Select(u => new AdminUserListItemDto(
                u.UserId,
                u.Name,
                u.Email,
                u.Phone,
                u.Status,
                u.Role,
                u.CreatedAt))
            .ToList();

        return Ok(AdminListHelper.ToPagedResult(items, p, ps, total));
    }

    /// <summary>
    /// Delete user account by id.
    /// </summary>
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> DeleteUser(int id)
    {
        var user = await _userRepo.GetByIdAsync(id);
        if (user == null)
            return NotFound(new { message = "User not found." });

        await _userRepo.DeleteAsync(id);
        return Ok(new { message = "User deleted successfully.", userId = id });
    }
}
