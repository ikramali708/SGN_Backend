using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SGN.Core.Interfaces;
using SGN.Core.Models;
using System.Security.Claims;

namespace SGN_Backend.Controllers;

[Route("api/customer/orders")]
[ApiController]
[Authorize(Roles = "Customer")]
[ApiExplorerSettings(GroupName = "CUSTOMER")]
[Tags("Customer")]
public class CustomerOrdersController : ControllerBase
{
    private readonly ICustomerService _customerService;

    public CustomerOrdersController(ICustomerService customerService)
    {
        _customerService = customerService;
    }

    /// <summary>
    /// Place a new order for the authenticated customer.
    /// </summary>
    [HttpPost]
    [ProducesResponseType(typeof(CustomerOrderResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(CustomerMessageDto), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(CustomerMessageDto), StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> PlaceOrder(CustomerOrderCreateDto dto)
    {
        if (!TryGetUserId(out var userId))
            return Unauthorized(new { message = "Invalid user token." });
        var result = await _customerService.PlaceOrderAsync(userId, dto);
        return StatusCode(result.StatusCode, result.Response);
    }

    /// <summary>
    /// Get all orders for the authenticated customer.
    /// </summary>
    [HttpGet]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(CustomerMessageDto), StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> GetMyOrders()
    {
        if (!TryGetUserId(out var userId))
            return Unauthorized(new { message = "Invalid user token." });
        var result = await _customerService.GetOrdersAsync(userId);
        return StatusCode(result.StatusCode, result.Response);
    }

    /// <summary>
    /// Get a specific order by id for the authenticated customer.
    /// </summary>
    [HttpGet("{id:int}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(CustomerMessageDto), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(CustomerMessageDto), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetOrderById(int id)
    {
        if (!TryGetUserId(out var userId))
            return Unauthorized(new { message = "Invalid user token." });
        var result = await _customerService.GetOrderByIdAsync(userId, id);
        return StatusCode(result.StatusCode, result.Response);
    }

    /// <summary>
    /// Cancel a pending order for the authenticated customer.
    /// </summary>
    [HttpPut("{id:int}/cancel")]
    [ProducesResponseType(typeof(CustomerMessageDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(CustomerMessageDto), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(CustomerMessageDto), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(CustomerMessageDto), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> CancelOrder(int id)
    {
        if (!TryGetUserId(out var userId))
            return Unauthorized(new { message = "Invalid user token." });
        var result = await _customerService.CancelOrderAsync(userId, id);
        return StatusCode(result.StatusCode, result.Response);
    }

    private bool TryGetUserId(out int userId)
    {
        var claimValue = User.FindFirstValue(ClaimTypes.NameIdentifier);
        return int.TryParse(claimValue, out userId);
    }
}
