using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SGN.Core.Interfaces;
using SGN.Core.Models;
using System.Security.Claims;

namespace SGN_Backend.Controllers;

[Route("api/customer")]
[ApiController]
[Authorize(Roles = "Customer")]
[ApiExplorerSettings(GroupName = "CUSTOMER")]
[Tags("Customer")]
public class CustomerProfileController : ControllerBase
{
    private readonly ICustomerService _customerService;

    public CustomerProfileController(ICustomerService customerService)
    {
        _customerService = customerService;
    }

    /// <summary>
    /// Get profile details of the authenticated customer.
    /// </summary>
    [HttpGet("profile")]
    [ProducesResponseType(typeof(CustomerProfileDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(CustomerMessageDto), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(CustomerMessageDto), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetProfile()
    {
        if (!TryGetUserId(out var userId))
            return Unauthorized(new { message = "Invalid user token." });

        var result = await _customerService.GetProfileAsync(userId);
        return StatusCode(result.StatusCode, result.Response);
    }

    /// <summary>
    /// Update profile details of the authenticated customer.
    /// </summary>
    [HttpPut("profile")]
    [ProducesResponseType(typeof(CustomerMessageDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(CustomerMessageDto), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(CustomerMessageDto), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateProfile(CustomerProfileUpdateDto dto)
    {
        if (!TryGetUserId(out var userId))
            return Unauthorized(new { message = "Invalid user token." });

        var result = await _customerService.UpdateProfileAsync(userId, dto);
        return StatusCode(result.StatusCode, result.Response);
    }

    /// <summary>
    /// Change password of the authenticated customer.
    /// </summary>
    [HttpPut("change-password")]
    [ProducesResponseType(typeof(CustomerMessageDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(CustomerMessageDto), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(CustomerMessageDto), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(CustomerMessageDto), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> ChangePassword(CustomerChangePasswordDto dto)
    {
        if (!TryGetUserId(out var userId))
            return Unauthorized(new { message = "Invalid user token." });

        var result = await _customerService.ChangePasswordAsync(userId, dto);
        return StatusCode(result.StatusCode, result.Response);
    }

    private bool TryGetUserId(out int userId)
    {
        var claimValue = User.FindFirstValue(ClaimTypes.NameIdentifier);
        return int.TryParse(claimValue, out userId);
    }
}
