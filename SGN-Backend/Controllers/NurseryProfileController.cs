using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using SGN.Core.Security;
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
    private readonly ILogger<NurseryProfileController> _logger;

    public NurseryProfileController(INurseryRepository nurseryRepo, ILogger<NurseryProfileController> logger)
    {
        _nurseryRepo = nurseryRepo;
        _logger = logger;
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
        try
        {
            var idClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (!int.TryParse(idClaim, out var nurseryId))
                return Unauthorized("Invalid nursery token.");

            var nursery = await _nurseryRepo.GetByIdAsync(nurseryId);
            if (nursery == null)
                return NotFound("Nursery not found.");

            var currentPassword = dto.CurrentPassword;
            if (string.IsNullOrWhiteSpace(currentPassword) || string.IsNullOrWhiteSpace(dto.NewPassword))
                return BadRequest("Current password and new password are required.");

            // Verify against stored hash; never compare plain text directly here.
            if (!PasswordVerification.SafeVerify(currentPassword, nursery.Password))
                return BadRequest("Current password is incorrect");

            nursery.Password = BCrypt.Net.BCrypt.HashPassword(dto.NewPassword);
            await _nurseryRepo.UpdateAsync(nursery);

            return Ok(new
            {
                message = "Password updated successfully"
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to change password for nursery id {NurseryId}.", User.FindFirst(ClaimTypes.NameIdentifier)?.Value);
            return StatusCode(500, new { message = "Failed to change password." });
        }
    }

    private bool TryGetNurseryId(out int nurseryId)
    {
        var claimValue = User.FindFirstValue(ClaimTypes.NameIdentifier);
        return int.TryParse(claimValue, out nurseryId);
    }
}
