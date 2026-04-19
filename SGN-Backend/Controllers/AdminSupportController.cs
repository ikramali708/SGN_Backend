using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SGN.Core.Interfaces;
using SGN.Core.Models;

namespace SGN_Backend.Controllers;

[Route("api/admin/support")]
[ApiController]
[Authorize(Roles = "Admin")]
[ApiExplorerSettings(GroupName = "ADMIN")]
[Tags("Admin")]
public class AdminSupportController : ControllerBase
{
    private readonly ISupportService _supportService;

    public AdminSupportController(ISupportService supportService)
    {
        _supportService = supportService;
    }

    /// <summary>
    /// List all support tickets with optional status filter (Open, InProgress, Resolved).
    /// </summary>
    [HttpGet]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> GetTickets([FromQuery] string? status)
    {
        var result = await _supportService.GetAllTicketsForAdminAsync(status);
        return StatusCode(result.StatusCode, result.Response);
    }

    /// <summary>
    /// Get ticket details including customer info and replies.
    /// </summary>
    [HttpGet("{id:int}")]
    [ProducesResponseType(typeof(AdminSupportTicketDetailDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> GetTicket(int id)
    {
        var result = await _supportService.GetTicketForAdminAsync(id);
        return StatusCode(result.StatusCode, result.Response);
    }

    /// <summary>
    /// Update ticket status.
    /// </summary>
    [HttpPut("{id:int}/status")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> UpdateStatus(int id, [FromBody] UpdateTicketStatusDto dto)
    {
        if (dto is null)
            return BadRequest(new { message = "Request body is required." });
        if (!ModelState.IsValid)
            return BadRequest(ModelState);
        var result = await _supportService.UpdateTicketStatusForAdminAsync(id, dto);
        return StatusCode(result.StatusCode, result.Response);
    }

    /// <summary>
    /// Add an admin reply to a ticket.
    /// </summary>
    [HttpPost("{id:int}/reply")]
    [ProducesResponseType(typeof(AdminSupportTicketDetailDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> Reply(int id, [FromBody] ReplyDto dto)
    {
        if (dto is null)
            return BadRequest(new { message = "Request body is required." });
        if (!ModelState.IsValid)
            return BadRequest(ModelState);
        var result = await _supportService.ReplyAsAdminAsync(id, dto);
        return StatusCode(result.StatusCode, result.Response);
    }
}
