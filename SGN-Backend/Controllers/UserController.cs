using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using SGN.Core.Interfaces;
using SGN.Core.Security;
using SGN.Data.Context;
using SGN.Domain.Entities;
using SGN.Domain.Interfaces;
using SGN_Backend.DTOs;

namespace SGN_Backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UserController : ControllerBase
    {
        private readonly IUserRepository _userRepo;
        private readonly INurseryRepository _nurseryRepo;
        private readonly IJwtService _jwtService;
        private readonly NurseryDbContext _context;

        public UserController(
            IUserRepository userRepo,
            INurseryRepository nurseryRepo,
            IJwtService jwtService,
            NurseryDbContext context)
        {
            _userRepo = userRepo;
            _nurseryRepo = nurseryRepo;
            _jwtService = jwtService;
            _context = context;
        }

        // TEMPORARY ENDPOINT – REMOVE AFTER USE
        [AllowAnonymous]
        [HttpGet("create-admin")]
        public async Task<IActionResult> CreateAdmin()
        {
            var adminExists = await _context.Users.AnyAsync(u => u.Role == "Admin");
            if (adminExists)
                return Ok("Admin already exists");

            _context.Users.Add(new User
            {
                Name = "Administrator",
                Email = "admin@gmail.com",
                Password = BCrypt.Net.BCrypt.HashPassword("123456"),
                Phone = string.Empty,
                Role = "Admin",
                Status = "Active",
                CreatedAt = DateTime.Now
            });
            await _context.SaveChangesAsync();

            return Ok("Admin created");
        }

        /// <summary>
        /// Register new customer account
        /// </summary>
        [AllowAnonymous]
        [HttpPost("register")]
        public async Task<IActionResult> Register(UserRegisterDto dto)
        {
            if (!string.IsNullOrWhiteSpace(dto.Role) &&
                !string.Equals(dto.Role, "Customer", StringComparison.OrdinalIgnoreCase))
                return BadRequest("Invalid registration.");

            var existingUsers = await _userRepo.GetAllAsync();
            if (existingUsers.Any(u => u.Email == dto.Email))
                return BadRequest("Email already exists");

            var user = new User
            {
                Name = dto.Name,
                Email = dto.Email,
                Password = BCrypt.Net.BCrypt.HashPassword(dto.Password),
                Phone = dto.Phone,
                Role = "Customer",
                Status = "Active",
                CreatedAt = DateTime.Now
            };

            await _userRepo.AddAsync(user);

            return Ok("User Registered Successfully");
        }

        /// <summary>
        /// Login user and return token
        /// </summary>
        [AllowAnonymous]
        [HttpPost("login")]
        public async Task<IActionResult> Login(UserLoginDto dto)
        {
            var user = await _userRepo.GetByEmailAsync(dto.Email);
            if (user != null)
            {
                if (!PasswordVerification.SafeVerify(dto.Password, user.Password))
                    return Unauthorized("Invalid email or password");

                var token = _jwtService.GenerateToken(user);
                return Ok(new
                {
                    token,
                    userId = user.UserId,
                    role = user.Role
                });
            }

            var nursery = await _nurseryRepo.GetByEmailAsync(dto.Email);
            if (nursery == null)
                return Unauthorized("Invalid email or password");

            if (!PasswordVerification.SafeVerify(dto.Password, nursery.Password))
                return Unauthorized("Invalid email or password");

            if (!string.Equals(nursery.ApprovalStatus, "Approved", StringComparison.OrdinalIgnoreCase))
                return Unauthorized("Nursery is not approved yet.");

            var nurseryToken = _jwtService.GenerateToken(new User
            {
                UserId = nursery.NurseryId,
                Email = nursery.Email,
                Role = "NurseryOwner"
            });

            return Ok(new
            {
                token = nurseryToken,
                userId = nursery.NurseryId,
                role = "NurseryOwner"
            });
        }

        /// <summary>
        /// Login customer and return token
        /// </summary>
        [AllowAnonymous]
        [HttpPost("login/customer")]
        public async Task<IActionResult> CustomerLogin(UserLoginDto dto)
        {
            return await LoginByRole(dto, "Customer");
        }

        /// <summary>
        /// Login nursery owner and return token
        /// </summary>
        [AllowAnonymous]
        [HttpPost("login/nursery-owner")]
        public async Task<IActionResult> NurseryOwnerLogin(UserLoginDto dto)
        {
            return await LoginByRole(dto, "NurseryOwner");
        }

        private async Task<IActionResult> LoginByRole(UserLoginDto dto, string? requiredRole)
        {
            var user = await _userRepo.GetByEmailAsync(dto.Email);
            if (user == null || !PasswordVerification.SafeVerify(dto.Password, user.Password))
                return Unauthorized("Invalid email or password");

            if (!string.IsNullOrWhiteSpace(requiredRole) &&
                !string.Equals(user.Role, requiredRole, StringComparison.OrdinalIgnoreCase))
            {
                return Unauthorized($"This account is not authorized for {requiredRole} login.");
            }

            var token = _jwtService.GenerateToken(user);

            return Ok(new
            {
                token,
                userId = user.UserId,
                role = user.Role
            });
        }

        /// <summary>
        /// Get user profile by id
        /// </summary>
        [Authorize]
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var user = await _userRepo.GetByIdAsync(id);
            if (user == null)
                return NotFound("User not found");

            return Ok(user);
        }

        /// <summary>
        /// Update customer profile details
        /// </summary>
        [Authorize(Roles = "Customer")]
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, UserUpdateDto dto)
        {
            var user = await _userRepo.GetByIdAsync(id);
            if (user == null)
                return NotFound("User not found");

            user.Name = dto.Name;
            user.Phone = dto.Phone;

            await _userRepo.UpdateAsync(user);

            return Ok("User Updated Successfully");
        }

        /// <summary>
        /// Delete customer account by id
        /// </summary>
        [Authorize(Roles = "Customer")]
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var user = await _userRepo.GetByIdAsync(id);
            if (user == null)
                return NotFound("User not found");

            await _userRepo.DeleteAsync(id);

            return Ok("User Deleted Successfully");
        }

        /// <summary>
        /// Change customer account password
        /// </summary>
        [Authorize(Roles = "Customer")]
        [HttpPut("change-password/{id}")]
        public async Task<IActionResult> ChangePassword(int id, ChangePasswordDto dto)
        {
            var user = await _userRepo.GetByIdAsync(id);
            if (user == null)
                return NotFound("User not found");

            if (!PasswordVerification.SafeVerify(dto.OldPassword, user.Password))
                return BadRequest("Old password incorrect");

            user.Password = BCrypt.Net.BCrypt.HashPassword(dto.NewPassword);

            await _userRepo.UpdateAsync(user);

            return Ok("Password Changed Successfully");
        }

        /// <summary>
        /// Get orders for specific user
        /// </summary>
        [Authorize(Roles = "Customer")]
        [HttpGet("{id}/orders")]
        public async Task<IActionResult> GetUserOrders(int id)
        {
            var user = await _userRepo.GetByIdAsync(id);
            if (user == null)
                return NotFound("User not found");

            return Ok(user.Orders);
        }
    }
}