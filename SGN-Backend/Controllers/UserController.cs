using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using SGN.Core.Interfaces;
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
        private readonly IJwtService _jwtService;

        public UserController(IUserRepository userRepo, IJwtService jwtService)
        {
            _userRepo = userRepo;
            _jwtService = jwtService;
        }

        /// <summary>
        /// Register new customer account
        /// </summary>
        [AllowAnonymous]
        [HttpPost("register")]
        public async Task<IActionResult> Register(UserRegisterDto dto)
        {
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
            return await LoginByRole(dto, null);
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
            if (user == null || !BCrypt.Net.BCrypt.Verify(dto.Password, user.Password))
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

            if (!BCrypt.Net.BCrypt.Verify(dto.OldPassword, user.Password))
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