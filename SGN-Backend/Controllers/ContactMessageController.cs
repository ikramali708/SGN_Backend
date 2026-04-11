using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SGN.Domain.Entities;
using SGN.Domain.Interfaces;

namespace SGN_Backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "EndUser")]
    public class ContactMessageController : ControllerBase
    {
        private readonly IContactMessageRepository _contactRepo;

        public ContactMessageController(IContactMessageRepository contactRepo)
        {
            _contactRepo = contactRepo;
        }

        /// <summary>
        /// Send message to admin team
        /// </summary>
        /// <param name="message">Message details</param>
        /// <returns>Saved message</returns>
        [HttpPost]
        [ProducesResponseType(typeof(ContactMessage), 200)]
        public async Task<IActionResult> SendMessage(ContactMessage message)
        {
            var userId = int.Parse(User.FindFirst("NameIdentifier")!.Value);
            message.UserId = userId;
            message.Status = "Pending";
            message.CreatedAt = DateTime.Now;

            await _contactRepo.AddAsync(message);
            return Ok(message);
        }

        /// <summary>
        /// Get current user message list
        /// </summary>
        /// <returns>List of user messages</returns>
        [HttpGet("my")]
        [ProducesResponseType(typeof(IEnumerable<ContactMessage>), 200)]
        public async Task<IActionResult> GetMyMessages()
        {
            var userId = int.Parse(User.FindFirst("NameIdentifier")!.Value);
            var messages = await _contactRepo.GetByUserIdAsync(userId);
            return Ok(messages);
        }
    }
}