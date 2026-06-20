using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using WomenSports.Data;
using WomenSports.DTOs;
using WomenSports.Models; 

namespace WomenSports.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class ProfileController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IWebHostEnvironment _environment;

        public ProfileController(AppDbContext context, IWebHostEnvironment environment)
        {
            _context = context;
            _environment = environment;
        }

        // GET: api/Profile (جلب بيانات البروفايل كاملة بما فيها الكفر)
        [HttpGet]
        public async Task<IActionResult> GetProfile()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null) return Unauthorized();
            
            var userId = int.Parse(userIdClaim.Value);

            var user = await _context.Users
                .Where(u => u.Id == userId)
                .Select(u => new 
                {
                    u.Username,
                    u.Email,
                    u.Bio,
                    u.FavoriteSports,
                    u.PhoneNumber,
                    u.ProfileImageUrl,
                    // ⚠️ إرجاع رابط الكفر ليوسف عشان يظهر في الشاشة الكبيرة
                    u.ProfileCoverUrl, 
                    u.CreatedAt,
                    CommentCount = u.Comments.Count,
                    u.ViolationCount,
                    u.IsBanned
                })
                .FirstOrDefaultAsync();

            if (user == null) return NotFound("User not found");

            return Ok(user);
        }

        // ==========================================
        // 🔥 ميثود الـ GET الجديدة: جلب رابط الـ Cover فقط (Get Cover Image URL)
        // ==========================================
        [HttpGet("cover")]
        public async Task<IActionResult> GetProfileCover()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null) return Unauthorized();

            var userId = int.Parse(userIdClaim.Value);
            var user = await _context.Users.FindAsync(userId);

            if (user == null) return NotFound("User not found");

            // لو اليوزر لسه مرفعش كفر، بنرجعله رسالة عشان يعرض ديفولت في الفرونت
            if (string.IsNullOrEmpty(user.ProfileCoverUrl))
            {
                return Ok(new { coverUrl = "", message = "No cover image uploaded yet. Use default layout." });
            }

            return Ok(new { coverUrl = user.ProfileCoverUrl });
        }

        // PUT: api/Profile (تعديل البيانات الأساسية وصورة البروفايل الشخصية)
        [HttpPut]
        public async Task<IActionResult> UpdateProfile([FromForm] UpdateProfileDTO dto, IFormFile? image)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null) return Unauthorized();

            var userId = int.Parse(userIdClaim.Value);
            var user = await _context.Users.FindAsync(userId);
            
            if (user == null) return NotFound("User not found");

            if (user.IsBanned && user.BannedUntil > DateTime.UtcNow)
                return Unauthorized(new { message = $"Banned until {user.BannedUntil}" });

            // 1. رفع الصورة الشخصية (لو فيه صورة جديدة)
            if (image != null && image.Length > 0)
            {
                var uploadsFolder = Path.Combine(_environment.WebRootPath, "uploads");
                if (!Directory.Exists(uploadsFolder)) Directory.CreateDirectory(uploadsFolder);

                var fileName = Guid.NewGuid().ToString() + Path.GetExtension(image.FileName);
                var filePath = Path.Combine(uploadsFolder, fileName);

                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await image.CopyToAsync(stream);
                }
                
                // تحديث الرابط بالصورة الجديدة مع السكيم والهوست لتجنب مشاكل اللينكات المقطوعة
                user.ProfileImageUrl = $"{Request.Scheme}://{Request.Host}/uploads/{fileName}";
            }

            // 2. تحديث الباسورد 
            if (!string.IsNullOrEmpty(dto.Password))
            {
                user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password);
            }

            // 3. تحديث البيانات الأساسية
            user.Bio = dto.Bio ?? user.Bio;
            user.Username = dto.Username ?? user.Username;
            user.Email = dto.Email ?? user.Email;
            user.PhoneNumber = dto.PhoneNumber ?? user.PhoneNumber;
            user.FavoriteSports = dto.FavoriteSports ?? user.FavoriteSports;

            await _context.SaveChangesAsync();

            return Ok(new { 
                message = "Profile updated successfully", 
                profileImageUrl = user.ProfileImageUrl,
                profileCoverUrl = user.ProfileCoverUrl // بنرجعه برضه زيادة تأكيد ليوسف
            });
        }

        // ⚠️ رفع وتحديث صورة الـ Cover (الغلاف) وحفظها في الداتابيز
        [HttpPut("update-cover")]
        public async Task<IActionResult> UpdateCover(IFormFile file)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null) return Unauthorized();

            var userId = int.Parse(userIdClaim.Value);
            var user = await _context.Users.FindAsync(userId);
            if (user == null) return NotFound("User not found");

            if (file != null && file.Length > 0)
            {
                // استخدام الـ WebRootPath عشان نضمن الرفع في wwwroot/uploads زي الصورة الشخصية
                var uploadsFolder = Path.Combine(_environment.WebRootPath, "uploads");
                if (!Directory.Exists(uploadsFolder)) Directory.CreateDirectory(uploadsFolder);

                var fileName = $"{Guid.NewGuid()}_{Path.GetFileName(file.FileName)}";
                var filePath = Path.Combine(uploadsFolder, fileName);

                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await file.CopyToAsync(stream);
                }

                // حفظ الرابط الكامل مع السكيم والهوست في الداتابيز عشان يثبت وميروحش تاني
                user.ProfileCoverUrl = $"{Request.Scheme}://{Request.Host}/uploads/{fileName}"; 
                await _context.SaveChangesAsync(); // السيف في قاعدة البيانات

                return Ok(new { coverUrl = user.ProfileCoverUrl });
            }

            return BadRequest("No file uploaded");
        }

        // POST: api/Profile/change-password (تغيير كلمة المرور يدوياً)
        [HttpPost("change-password")]
        public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordRequest request)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
            var user = await _context.Users.FindAsync(userId);

            if (user == null) return NotFound();

            if (!BCrypt.Net.BCrypt.Verify(request.OldPassword, user.PasswordHash))
                return BadRequest("كلمة المرور القديمة غير صحيحة");

            if (request.NewPassword != request.ConfirmPassword)
                return BadRequest("كلمات المرور الجديدة غير متطابقة");

            user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.NewPassword);
            await _context.SaveChangesAsync();

            return Ok(new { message = "تم تغيير كلمة المرور بنجاح" });
        }
    }

    public class ChangePasswordRequest {
        public string OldPassword { get; set; } = string.Empty;
        public string NewPassword { get; set; } = string.Empty;
        public string ConfirmPassword { get; set; } = string.Empty;
    }
}