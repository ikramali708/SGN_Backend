using Microsoft.AspNetCore.Mvc;
using SGN.Domain.Entities;
using SGN.Domain.Interfaces;
using  SGN_Backend.DTOs;

namespace SGN_Backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UserController : ControllerBase
    {
        private readonly IUserRepository _userRepo;

        public UserController(IUserRepository userRepo)
        {
            _userRepo = userRepo;
        }

        // ================= REGISTER =================
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
                Password = dto.Password,
                Phone = dto.Phone,
                Role = "EndUser",
                Status = "Active",
                CreatedAt = DateTime.Now
            };

            await _userRepo.AddAsync(user);

            return Ok("User Registered Successfully");
        }

        // ================= LOGIN =================
        [HttpPost("login")]
        public async Task<IActionResult> Login(UserLoginDto dto)
        {
            var users = await _userRepo.GetAllAsync();
            var user = users.FirstOrDefault(u =>
                u.Email == dto.Email && u.Password == dto.Password);

            if (user == null)
                return Unauthorized("Invalid email or password");

            return Ok(user);
        }

        // ================= GET ALL =================
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var users = await _userRepo.GetAllAsync();
            return Ok(users);
        }

        // ================= GET BY ID =================
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var user = await _userRepo.GetByIdAsync(id);
            if (user == null)
                return NotFound("User not found");

            return Ok(user);
        }

        // ================= UPDATE PROFILE =================
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

        // ================= DELETE =================
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var user = await _userRepo.GetByIdAsync(id);
            if (user == null)
                return NotFound("User not found");

            await _userRepo.DeleteAsync(id);

            return Ok("User Deleted Successfully");
        }

        // ================= CHANGE PASSWORD =================
        [HttpPut("change-password/{id}")]
        public async Task<IActionResult> ChangePassword(int id, ChangePasswordDto dto)
        {
            var user = await _userRepo.GetByIdAsync(id);
            if (user == null)
                return NotFound("User not found");

            if (user.Password != dto.OldPassword)
                return BadRequest("Old password incorrect");

            user.Password = dto.NewPassword;

            await _userRepo.UpdateAsync(user);

            return Ok("Password Changed Successfully");
        }

        // ================= GET USER ORDERS =================
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