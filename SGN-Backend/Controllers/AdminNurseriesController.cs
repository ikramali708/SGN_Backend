using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SGN.Domain.Interfaces;
using SGN_Backend.DTOs;

namespace SGN_Backend.Controllers;

/// <summary>
/// Admin nursery approval and listing.
/// </summary>
[Route("api/admin/nurseries")]
[ApiController]
[Authorize(Roles = "Admin")]
[ApiExplorerSettings(GroupName = "ADMIN")]
[Tags("Admin Nurseries")]
public class AdminNurseriesController : ControllerBase
{
    private readonly INurseryRepository _nurseryRepo;

    public AdminNurseriesController(INurseryRepository nurseryRepo)
    {
        _nurseryRepo = nurseryRepo;
    }

    /// <summary>
    /// List all nurseries (optional search on name, owner, email, city, address)
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<AdminNurseryListItemDto>>> GetNurseries([FromQuery] string? search)
    {
        var all = (await _nurseryRepo.GetAllAsync()).ToList();

        if (!string.IsNullOrWhiteSpace(search))
        {
            var s = search.Trim();
            all = all.Where(n =>
                    n.NurseryName.Contains(s, StringComparison.OrdinalIgnoreCase) ||
                    n.OwnerName.Contains(s, StringComparison.OrdinalIgnoreCase) ||
                    n.Email.Contains(s, StringComparison.OrdinalIgnoreCase) ||
                    n.City.Contains(s, StringComparison.OrdinalIgnoreCase) ||
                    n.Address.Contains(s, StringComparison.OrdinalIgnoreCase))
                .ToList();
        }

        var items = all
            .OrderByDescending(n => n.CreatedAt)
            .Select(n => new AdminNurseryListItemDto(
                n.NurseryId,
                n.NurseryName,
                n.OwnerName,
                n.Email,
                n.Phone,
                n.Address,
                n.City,
                n.ApprovalStatus,
                n.Status,
                n.CreatedAt))
            .ToList();

        return Ok(items);
    }

    /// <summary>
    /// Approve nursery registration request
    /// </summary>
    [HttpPut("{id:int}/approve")]
    public async Task<IActionResult> ApproveNursery(int id)
    {
        var nursery = await _nurseryRepo.GetByIdAsync(id);
        if (nursery == null)
            return NotFound("Nursery not found.");

        nursery.ApprovalStatus = "Approved";
        await _nurseryRepo.UpdateAsync(nursery);

        return Ok(new
        {
            message = "Nursery approved successfully.",
            nurseryId = nursery.NurseryId,
            approvalStatus = nursery.ApprovalStatus
        });
    }

    /// <summary>
    /// Reject nursery registration request
    /// </summary>
    [HttpPut("{id:int}/reject")]
    public async Task<IActionResult> RejectNursery(int id)
    {
        var nursery = await _nurseryRepo.GetByIdAsync(id);
        if (nursery == null)
            return NotFound("Nursery not found.");

        nursery.ApprovalStatus = "Rejected";
        await _nurseryRepo.UpdateAsync(nursery);

        return Ok(new
        {
            message = "Nursery rejected.",
            nurseryId = nursery.NurseryId,
            approvalStatus = nursery.ApprovalStatus
        });
    }
}
