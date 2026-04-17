using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SGN.Core.Interfaces;
using SGN.Core.Security;
using SGN.Domain.Entities;
using SGN.Domain.Interfaces;
using SGN_Backend.DTOs;

namespace SGN_Backend.Controllers;

[Route("api/nursery/auth")]
[ApiController]
[ApiExplorerSettings(GroupName = "NURSERY")]
[Tags("Nursery Auth")]
public class NurseryAuthController : ControllerBase
{
    private readonly INurseryRepository _nurseryRepo;
    private readonly IJwtService _jwtService;

    public NurseryAuthController(INurseryRepository nurseryRepo, IJwtService jwtService)
    {
        _nurseryRepo = nurseryRepo;
        _jwtService = jwtService;
    }

    [AllowAnonymous]
    [HttpPost("signup")]
    public async Task<IActionResult> Signup([FromBody] NurseryOwnerSignupDto dto)
    {
        if (string.Equals(dto.Role, "Admin", StringComparison.OrdinalIgnoreCase))
            return BadRequest("Invalid registration.");

        var existing = await _nurseryRepo.GetByEmailAsync(dto.Email);
        if (existing != null)
            return BadRequest("Nursery with this email already exists.");

        var nursery = new Nursery
        {
            NurseryName = dto.NurseryName,
            OwnerName = dto.OwnerName,
            Email = dto.Email,
            Password = BCrypt.Net.BCrypt.HashPassword(dto.Password),
            Phone = (dto.Phone ?? string.Empty).Trim(),
            Address = (dto.Address ?? string.Empty).Trim(),
            City = string.Empty,
            ApprovalStatus = "Pending",
            Status = "Active",
            CreatedAt = DateTime.Now
        };

        await _nurseryRepo.AddAsync(nursery);

        return Ok(new
        {
            message = "Nursery signup successful. Waiting for admin approval."
        });
    }

    [AllowAnonymous]
    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] NurseryOwnerLoginDto dto)
    {
        var nursery = await _nurseryRepo.GetByEmailAsync(dto.Email);
        if (nursery == null)
            return Unauthorized("Invalid email or password.");

        var passwordMatches = PasswordVerification.SafeVerify(dto.Password, nursery.Password);
        if (!passwordMatches)
            return Unauthorized("Invalid email or password.");

        if (!string.Equals(nursery.ApprovalStatus, "Approved", StringComparison.OrdinalIgnoreCase))
            return Unauthorized("Nursery is not approved yet.");

        var token = _jwtService.GenerateToken(new User
        {
            UserId = nursery.NurseryId,
            Email = nursery.Email,
            Role = "NurseryOwner"
        });

        return Ok(new
        {
            token,
            nurseryId = nursery.NurseryId,
            role = "NurseryOwner"
        });
    }
}
