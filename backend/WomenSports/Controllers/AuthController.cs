using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using WomenSports.Data;
using WomenSports.DTOs;
using WomenSports.Models;

namespace WomenSports.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IConfiguration _config;

        public AuthController(AppDbContext context, IConfiguration config)
        {
            _context = context;
            _config = config;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register(RegisterDTO dto)
        {
            if (await _context.Users.AnyAsync(u => u.Email == dto.Email))
                return BadRequest("Email already exists");

            if (await _context.Users.AnyAsync(u => u.Username == dto.Username))
                return BadRequest("Username already exists");

            var user = new User
            {
                Username = dto.Username,
                Email = dto.Email,
                Role = "User", 
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),
                CreatedAt = DateTime.UtcNow
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            return Ok("Registration successful");
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login(LoginDTO dto)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == dto.Email);

            if (user == null || !BCrypt.Net.BCrypt.Verify(dto.Password, user.PasswordHash))
                return Unauthorized("Invalid email or password");

            // لو مدة البان خلصت، بنفك الحظر تلقائي هنا
            if (user.IsBanned && user.BannedUntil <= DateTime.UtcNow)
            {
                user.IsBanned = false;
                user.BannedUntil = null;
                await _context.SaveChangesAsync();
            }

            // ⚠️ التعديل المطلوب: لو لسه واخد بان ووقته مخلصش يرجع 403 Forbidden مع رسالة واضحة
            if (user.IsBanned && user.BannedUntil > DateTime.UtcNow)
                return StatusCode(403, new
                {
                    message = $"Your account has been banned until {user.BannedUntil}",
                    bannedUntil = user.BannedUntil
                });

            var token = GenerateToken(user);

            // إرجاع البيانات كاملة ليوسف عشان الدخول ينجح والـ Context يتملي عنده
            return Ok(new 
            {
                token = token,
                role = user.Role, 
                userId = user.Id,
                username = user.Username,
                email = user.Email
            });
        }

        private string GenerateToken(User user)
        {
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_config["Jwt:Key"]!));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var claims = new[]
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Email, user.Email),
                new Claim(ClaimTypes.Role, user.Role ?? "User")
            };

            var token = new JwtSecurityToken(
                issuer: _config["Jwt:Issuer"],
                audience: _config["Jwt:Audience"],
                claims: claims,
                expires: DateTime.UtcNow.AddDays(7),
                signingCredentials: creds
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}