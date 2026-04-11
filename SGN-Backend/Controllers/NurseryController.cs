using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SGN.Core.Interfaces;
using SGN.Domain.Entities;
using SGN.Domain.Interfaces;
using SGN_Backend.DTOs;

namespace SGN_Backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class NurseryController : ControllerBase
    {
        private readonly INurseryRepository _nurseryRepo;
        private readonly IJwtService _jwtService;

        public NurseryController(INurseryRepository nurseryRepo, IJwtService jwtService)
        {
            _nurseryRepo = nurseryRepo;
            _jwtService = jwtService;
        }

        /// <summary>
        /// Register new nursery owner account
        /// </summary>
        [AllowAnonymous]
        [HttpPost("signup")]
        public async Task<IActionResult> Signup(NurserySignupDto dto)
        {
            var existing = await _nurseryRepo.GetByEmailAsync(dto.Email);
            if (existing != null)
                return BadRequest("Nursery with this email already exists.");

            var nursery = new Nursery
            {
                NurseryName = dto.NurseryName,
                OwnerName = dto.OwnerName,
                Email = dto.Email,
                Password = BCrypt.Net.BCrypt.HashPassword(dto.Password),
                Phone = dto.Phone,
                Address = dto.Address,
                City = dto.City,
                ApprovalStatus = "Pending",
                Status = "Active",
                CreatedAt = DateTime.Now
            };

            await _nurseryRepo.AddAsync(nursery);

            return Ok(new
            {
                message = "Nursery signup successful. Waiting for admin approval.",
                nurseryId = nursery.NurseryId,
                approvalStatus = nursery.ApprovalStatus
            });
        }

        /// <summary>
        /// Login nursery owner and check approval
        /// </summary>
        [AllowAnonymous]
        [HttpPost("login")]
        public async Task<IActionResult> Login(NurseryLoginDto dto)
        {
            var nursery = await _nurseryRepo.GetByEmailAsync(dto.Email);
            if (nursery == null)
                return Unauthorized("Invalid email or password.");

            var passwordMatches = BCrypt.Net.BCrypt.Verify(dto.Password, nursery.Password) || nursery.Password == dto.Password;
            if (!passwordMatches)
                return Unauthorized("Invalid email or password.");

            if (string.Equals(nursery.ApprovalStatus, "Pending", StringComparison.OrdinalIgnoreCase))
            {
                return Unauthorized(new
                {
                    message = "Waiting for admin approval",
                    approvalStatus = nursery.ApprovalStatus
                });
            }

            if (string.Equals(nursery.ApprovalStatus, "Rejected", StringComparison.OrdinalIgnoreCase))
            {
                return Unauthorized(new
                {
                    message = "Your request has been rejected",
                    approvalStatus = nursery.ApprovalStatus
                });
            }

            var token = _jwtService.GenerateToken(new User
            {
                UserId = nursery.NurseryId,
                Email = nursery.Email,
                Role = "NurseryOwner"
            });

            return Ok(new
            {
                message = "Nursery login successful",
                token,
                nurseryId = nursery.NurseryId,
                approvalStatus = nursery.ApprovalStatus,
                role = "NurseryOwner"
            });
        }

    }
}
