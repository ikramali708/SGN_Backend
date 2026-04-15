using Microsoft.AspNetCore.Mvc;
using SGN.Core.Interfaces;
using SGN.Core.Models;

namespace SGN_Backend.Controllers;

[Route("api/customer/auth")]
[ApiController]
[ApiExplorerSettings(GroupName = "CUSTOMER")]
[Tags("Customer")]
public class CustomerAuthController : ControllerBase
{
    private readonly ICustomerService _customerService;

    public CustomerAuthController(ICustomerService customerService)
    {
        _customerService = customerService;
    }

    /// <summary>
    /// Register a new customer account.
    /// </summary>
    [HttpPost("register")]
    [ProducesResponseType(typeof(CustomerMessageDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(CustomerMessageDto), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Register(CustomerRegisterDto dto)
    {
        var result = await _customerService.RegisterAsync(dto);
        return StatusCode(result.StatusCode, result.Response);
    }

    /// <summary>
    /// Login as customer and receive JWT token.
    /// </summary>
    [HttpPost("login")]
    [ProducesResponseType(typeof(CustomerLoginResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(CustomerMessageDto), StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> Login(CustomerLoginDto dto)
    {
        var result = await _customerService.LoginAsync(dto);
        return StatusCode(result.StatusCode, result.Response);
    }
}
