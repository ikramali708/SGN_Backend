using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SGN.Core.Interfaces;
using SGN.Core.Models;
using System.Security.Claims;

namespace SGN_Backend.Controllers;

[Route("api/customer/support")]
[ApiController]
[Authorize(Roles = "Customer")]
[ApiExplorerSettings(GroupName = "CUSTOMER")]
[Tags("Customer")]
public class CustomerSupportController : ControllerBase
{
    private readonly ISupportService _supportService;

    public CustomerSupportController(ISupportService supportService)
    {
        _supportService = supportService;
    }

    /// <summary>
    /// Create a new support ticket.
    /// </summary>
    [HttpPost]
    [ProducesResponseType(typeof(SupportTicketSummaryDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> CreateTicket([FromBody] CreateTicketDto dto)
    {
        if (!TryGetUserId(out var userId))
            return Unauthorized(new { message = "Invalid user token." });
        if (dto is null)
            return BadRequest(new { message = "Request body is required." });
        if (!ModelState.IsValid)
            return BadRequest(ModelState);
        var result = await _supportService.CreateTicketAsync(userId, dto);
        return StatusCode(result.StatusCode, result.Response);
    }

    /// <summary>
    /// List support tickets for the authenticated customer.
    /// </summary>
    [HttpGet]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> GetMyTickets()
    {
        if (!TryGetUserId(out var userId))
            return Unauthorized(new { message = "Invalid user token." });
        var result = await _supportService.GetMyTicketsAsync(userId);
        return StatusCode(result.StatusCode, result.Response);
    }

    /// <summary>
    /// Get a ticket with replies for the authenticated customer.
    /// </summary>
    [HttpGet("{id:int}")]
    [ProducesResponseType(typeof(SupportTicketDetailDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> GetMyTicket(int id)
    {
        if (!TryGetUserId(out var userId))
            return Unauthorized(new { message = "Invalid user token." });
        var result = await _supportService.GetMyTicketByIdAsync(userId, id);
        return StatusCode(result.StatusCode, result.Response);
    }

    /// <summary>
    /// Add a customer reply to a ticket.
    /// </summary>
    [HttpPost("{id:int}/reply")]
    [ProducesResponseType(typeof(SupportTicketDetailDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> Reply(int id, [FromBody] ReplyDto dto)
    {
        if (!TryGetUserId(out var userId))
            return Unauthorized(new { message = "Invalid user token." });
        if (dto is null)
            return BadRequest(new { message = "Request body is required." });
        if (!ModelState.IsValid)
            return BadRequest(ModelState);
        var result = await _supportService.ReplyAsCustomerAsync(userId, id, dto);
        return StatusCode(result.StatusCode, result.Response);
    }

    private bool TryGetUserId(out int userId)
    {
        var claimValue = User.FindFirstValue(ClaimTypes.NameIdentifier);
        return int.TryParse(claimValue, out userId);
    }
}
