using Microsoft.AspNetCore.Mvc;
using System.ComponentModel.DataAnnotations;
using WomenSports.Data;
using WomenSports.Models;
using Microsoft.EntityFrameworkCore;

namespace WomenSports.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ContactController : ControllerBase
    {
        private readonly AppDbContext _context;

        public ContactController(AppDbContext context)
        {
            _context = context;
        }

        [HttpPost]
        public async Task<IActionResult> SendMessage([FromBody] ContactDTO dto)
        {
            //if (!ModelState.IsValid)
            //    return BadRequest(ModelState);

            // Rate Limiting - max 3 messages per day per email
            var today = DateTime.UtcNow.Date;
            var messageCount = await _context.ContactMessages
                .CountAsync(m => m.Email == dto.Email && m.CreatedAt >= today);

            if (messageCount >= 3)
                return BadRequest("You have reached the maximum of 3 messages per day");

            var message = new ContactMessage
            {
                Name = dto.Name,
                Email = dto.Email,
                Subject = dto.Subject,
                Message = dto.Message
            };

            _context.ContactMessages.Add(message);
            await _context.SaveChangesAsync();

            return Ok(new{
                message = "Message sent successfully"
            });
        }
    }

    public class ContactDTO
    {
        [Required(ErrorMessage = "Name is required")]
        [MinLength(2, ErrorMessage = "Name must be at least 2 characters")]
        public string Name { get; set; } = string.Empty;

        [Required(ErrorMessage = "Email is required")]
        [EmailAddress(ErrorMessage = "Invalid email format")]
        public string Email { get; set; } = string.Empty;

        [Required(ErrorMessage = "Subject is required")]
        public string Subject { get; set; } = string.Empty;

        [Required(ErrorMessage = "Message is required")]
        [MinLength(10, ErrorMessage = "Message must be at least 10 characters")]
        public string Message { get; set; } = string.Empty;
    }
}