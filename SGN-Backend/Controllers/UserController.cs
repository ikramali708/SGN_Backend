using Microsoft.AspNetCore.Mvc;
using SGN.Domain.Entities;
using SGN.Domain.Interfaces;

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

        // GET: api/User
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var users = await _userRepo.GetAllAsync();
            return Ok(users);
        }

        // GET: api/User/5
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var user = await _userRepo.GetByIdAsync(id);
            if (user == null) return NotFound();
            return Ok(user);
        }

        // POST: api/User
        [HttpPost]
        public async Task<IActionResult> Create(User user)
        {
            var created = await _userRepo.AddAsync(user);
            return CreatedAtAction(nameof(GetById), new { id = created.UserId }, created);
        }

        // PUT: api/User/5
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, User user)
        {
            if (id != user.UserId) return BadRequest();

            await _userRepo.UpdateAsync(user);
            return NoContent();
        }

        // DELETE: api/User/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            await _userRepo.DeleteAsync(id);
            return NoContent();
        }

        // POST: api/User/login
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] User loginUser)
        {
            var allUsers = await _userRepo.GetAllAsync();
            var user = allUsers.FirstOrDefault(u =>
                u.Email == loginUser.Email && u.Password == loginUser.Password);

            if (user == null) return Unauthorized("Invalid credentials");
            return Ok(user);
        }
    }
}