using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SGN.Core.Interfaces;
using SGN.Core.Security;
using SGN.Domain.Interfaces;
using SGN_Backend.DTOs;

namespace SGN_Backend.Controllers;

/// <summary>
/// Admin authentication.
/// </summary>
[Route("api/admin/auth")]
[ApiController]
[ApiExplorerSettings(GroupName = "ADMIN")]
[Tags("Admin Auth")]
public class AdminAuthController : ControllerBase
{
    private readonly IUserRepository _userRepo;
    private readonly IJwtService _jwtService;

    public AdminAuthController(IUserRepository userRepo, IJwtService jwtService)
    {
        _userRepo = userRepo;
        _jwtService = jwtService;
    }

    /// <summary>
    /// Login as admin and receive a JWT (role Admin)
    /// </summary>
    [AllowAnonymous]
    [HttpPost("login")]
    public async Task<IActionResult> Login(UserLoginDto dto)
    {
        var user = await _userRepo.GetByEmailAsync(dto.Email);
        if (user == null)
            return Unauthorized("Invalid email or password");

        var passwordOk = PasswordVerification.SafeVerify(dto.Password, user.Password);
        if (!passwordOk)
            return Unauthorized("Invalid email or password");

        if (!string.Equals(user.Role, "Admin", StringComparison.OrdinalIgnoreCase))
            return Unauthorized("This account is not authorized for Admin login.");

        var token = _jwtService.GenerateToken(user);

        return Ok(new
        {
            token,
            userId = user.UserId,
            role = user.Role
        });
    }
}
