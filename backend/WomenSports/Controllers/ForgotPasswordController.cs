using MailKit.Net.Smtp;
using MailKit.Security;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MimeKit;
using System.ComponentModel.DataAnnotations;
using WomenSports.Data;
using WomenSports.Models;

namespace WomenSports.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ForgotPasswordController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IConfiguration _config;

        public ForgotPasswordController(AppDbContext context, IConfiguration config)
        {
            _context = context;
            _config = config;
        }

        [HttpPost("send-otp")]
        public async Task<IActionResult> SendOtp([FromBody] SendOtpDTO dto)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == dto.Email);
            if (user == null) return NotFound(new { message = "Email not found" });

            var otp = new Random().Next(100000, 999999).ToString();

            var otpRecord = new PasswordResetOtp
            {
                Email = dto.Email,
                Otp = otp,
                ExpiresAt = DateTime.UtcNow.AddMinutes(10), 
                IsUsed = false
            };

            _context.PasswordResetOtps.Add(otpRecord);
            await _context.SaveChangesAsync();

            Console.WriteLine($"--- [System] OTP for {dto.Email} is: {otp} ---");

            try 
            {
                await SendEmail(dto.Email, otp);
                return Ok(new { message = "OTP sent to your email", devOtp = otp });
            }
            catch
            {
                return Ok(new { message = "Email failed, use devOtp for testing", devOtp = otp });
            }
        }

        [HttpPost("verify-otp")]
        public async Task<IActionResult> VerifyOtp([FromBody] VerifyOtpDTO dto)
        {
            // التعديل: بنجيب أحدث كود انطلب عشان نتفادى الـ Expired Codes القديمة
            var otpRecord = await _context.PasswordResetOtps
                .Where(o => o.Email == dto.Email && o.Otp == dto.Otp && !o.IsUsed)
                .OrderByDescending(o => o.Id) 
                .FirstOrDefaultAsync();

            if (otpRecord == null || otpRecord.ExpiresAt < DateTime.UtcNow)
                return BadRequest(new { message = "Invalid or expired OTP" });

            // التعديل الجوهري: رجعنا JSON Object عشان يوسف ميعلقش في صفحة الـ OTP
            return Ok(new { message = "OTP is valid", success = true });
        }

        [HttpPost("reset-password")]
        public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordDTO dto)
        {
            var otpRecord = await _context.PasswordResetOtps
                .Where(o => o.Email == dto.Email && o.Otp == dto.Otp && !o.IsUsed)
                .OrderByDescending(o => o.Id)
                .FirstOrDefaultAsync();

            if (otpRecord == null || otpRecord.ExpiresAt < DateTime.UtcNow)
                return BadRequest(new { message = "Invalid OTP" });

            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == dto.Email);
            if (user == null) return NotFound(new { message = "User not found" });

            user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.NewPassword);
            otpRecord.IsUsed = true; 
            
            await _context.SaveChangesAsync();

            return Ok(new { message = "Password reset successfully" });
        }

        private async Task SendEmail(string toEmail, string otp)
        {
            var fromEmail = _config["EmailSettings:Email"];
            var password = _config["EmailSettings:Password"];
            if (string.IsNullOrEmpty(fromEmail)) throw new Exception("Settings missing");

            var email = new MimeMessage();
            email.From.Add(new MailboxAddress("Women Sports", fromEmail));
            email.To.Add(MailboxAddress.Parse(toEmail));
            email.Subject = "OTP Code";
            email.Body = new TextPart("html") { Text = $"<h1>{otp}</h1>" };

            using var smtp = new SmtpClient();
            await smtp.ConnectAsync("smtp.gmail.com", 587, SecureSocketOptions.StartTls);
            await smtp.AuthenticateAsync(fromEmail, password);
            await smtp.SendAsync(email);
            await smtp.DisconnectAsync(true);
        }
    }

    public class SendOtpDTO 
    { 
        [Required] public string Email { get; set; } = string.Empty; 
    }

    public class VerifyOtpDTO 
    { 
        [Required] public string Email { get; set; } = string.Empty; 
        [Required] public string Otp { get; set; } = string.Empty; 
    }

    public class ResetPasswordDTO 
    { 
        [Required] public string Email { get; set; } = string.Empty; 
        [Required] public string Otp { get; set; } = string.Empty; 
        [Required] public string NewPassword { get; set; } = string.Empty; 
    }
}