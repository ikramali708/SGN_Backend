using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SGN.Domain.Interfaces;
using SGN_Backend.DTOs;
using System.Security.Claims;

namespace SGN_Backend.Controllers;

[Route("api/nursery")]
[ApiController]
[Authorize(Roles = "NurseryOwner")]
[ApiExplorerSettings(GroupName = "NURSERY")]
[Tags("Nursery Profile")]
public class NurseryProfileController : ControllerBase
{
    private readonly INurseryRepository _nurseryRepo;

    public NurseryProfileController(INurseryRepository nurseryRepo)
    {
        _nurseryRepo = nurseryRepo;
    }

    [HttpGet("profile")]
    public async Task<IActionResult> GetProfile()
    {
        if (!TryGetNurseryId(out var nurseryId))
            return Unauthorized("Invalid nursery token.");

        var nursery = await _nurseryRepo.GetByIdAsync(nurseryId);
        if (nursery == null)
            return NotFound("Nursery not found.");

        return Ok(new
        {
            nursery.NurseryId,
            nursery.NurseryName,
            nursery.OwnerName,
            nursery.Email,
            nursery.Phone,
            nursery.Address,
            nursery.City,
            nursery.ApprovalStatus,
            nursery.Status,
            nursery.CreatedAt
        });
    }

    [HttpPut("profile")]
    public async Task<IActionResult> UpdateProfile([FromBody] NurseryProfileUpdateDto dto)
    {
        if (!TryGetNurseryId(out var nurseryId))
            return Unauthorized("Invalid nursery token.");

        var nursery = await _nurseryRepo.GetByIdAsync(nurseryId);
        if (nursery == null)
            return NotFound("Nursery not found.");

        var existingByEmail = await _nurseryRepo.GetByEmailAsync(dto.Email);
        if (existingByEmail != null && existingByEmail.NurseryId != nurseryId)
            return BadRequest("Email is already in use by another nursery.");

        nursery.NurseryName = dto.NurseryName;
        nursery.OwnerName = dto.OwnerName;
        nursery.Email = dto.Email;

        await _nurseryRepo.UpdateAsync(nursery);

        return Ok(new
        {
            message = "Profile updated successfully."
        });
    }

    [HttpPut("change-password")]
    public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordDto dto)
    {
        if (!TryGetNurseryId(out var nurseryId))
            return Unauthorized("Invalid nursery token.");

        var nursery = await _nurseryRepo.GetByIdAsync(nurseryId);
        if (nursery == null)
            return NotFound("Nursery not found.");

        var oldPasswordMatches = BCrypt.Net.BCrypt.Verify(dto.OldPassword, nursery.Password) || nursery.Password == dto.OldPassword;
        if (!oldPasswordMatches)
            return Unauthorized("Old password is incorrect.");

        nursery.Password = BCrypt.Net.BCrypt.HashPassword(dto.NewPassword);
        await _nurseryRepo.UpdateAsync(nursery);

        return Ok(new
        {
            message = "Password changed successfully."
        });
    }

    private bool TryGetNurseryId(out int nurseryId)
    {
        var claimValue = User.FindFirstValue(ClaimTypes.NameIdentifier);
        return int.TryParse(claimValue, out nurseryId);
    }
}
