using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using WomenSports.Data;
using WomenSports.Models;

namespace WomenSports.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize] // محمي بالـ Token
    public class AdminController : ControllerBase
    {
        private readonly AppDbContext _context;

        public AdminController(AppDbContext context)
        {
            _context = context;
        }

        // ==========================================
        // 1. الإحصائيات (Stats Dashboard)
        // ==========================================
        [HttpGet("stats")]
        public async Task<IActionResult> GetStats()
        {
            var userRole = User.FindFirst(ClaimTypes.Role)?.Value;
            if (userRole != "Admin") return Forbid();

            var categoryStats = await _context.Posts
                .GroupBy(p => p.Category)
                .Select(g => new { category = g.Key, count = g.Count() })
                .ToListAsync();

            var stats = new
            {
                TotalUsers = await _context.Users.CountAsync(u => u.Role != "Admin"),
                TotalPosts = await _context.Posts.CountAsync(),
                TotalComments = await _context.Comments.CountAsync(),
                TotalLikes = await _context.Likes.CountAsync(),
                HateSpeechDetected = await _context.Comments.CountAsync(c => !c.IsApproved),
                CategoryDistribution = categoryStats
            };

            return Ok(stats);
        }

        // ==========================================
        // 2. إدارة المستخدمين (Get All Users)
        // ==========================================
        [HttpGet("users")]
        public async Task<IActionResult> GetUsers()
        {
            var userRole = User.FindFirst(ClaimTypes.Role)?.Value;
            if (userRole != "Admin") return Forbid();

            var users = await _context.Users
                .Select(u => new
                {
                    u.Id,
                    u.Username,
                    u.Email,
                    u.Role,
                    u.ViolationCount,
                    u.BanCount,
                    u.IsBanned,
                    u.BannedUntil,
                    u.CreatedAt,
                    CommentCount = u.Comments.Count
                })
                .OrderByDescending(u => u.ViolationCount)
                .ToListAsync();

            return Ok(users);
        }

        // ==========================================
        // 🔥 ميثود الـ GET الجديدة: جلب مستخدم معين بالـ ID
        // ==========================================
        [HttpGet("user/{userId}")]
        public async Task<IActionResult> GetUserById(int userId)
        {
            var userRole = User.FindFirst(ClaimTypes.Role)?.Value;
            if (userRole != "Admin") return Forbid();

            var user = await _context.Users
                .Include(u => u.Comments)
                .FirstOrDefaultAsync(u => u.Id == userId);

            if (user == null)
            {
                return NotFound(new { message = "User not found in the database system." });
            }

            var result = new
            {
                user.Id,
                user.Username,
                user.Email,
                user.Role,
                user.ViolationCount,
                user.BanCount,
                user.IsBanned,
                user.BannedUntil,
                user.CreatedAt,
                CommentCount = user.Comments.Count
            };

            return Ok(result);
        }

        // ==========================================
        // 3. جدول الكومنتات المسيئة (Hate-Speech Dashboard)
        // ==========================================
        [HttpGet("hate-speech")]
        public async Task<IActionResult> GetHateSpeechComments()
        {
            var userRole = User.FindFirst(ClaimTypes.Role)?.Value;
            if (userRole != "Admin") return Forbid();

            var flaggedComments = await _context.Comments
                .Where(c => !c.IsApproved) // الكومنتات المرفوضة بالـ AI
                .Include(c => c.User)
                .Include(c => c.Post)
                .Select(c => new
                {
                    id = c.Id,
                    content = c.Content,
                    rawText = c.Content, // طلب يوسف الأول
                    postId = c.PostId,
                    postTitle = c.Post != null ? c.Post.Title : "Unknown Post",
                    userId = c.UserId,
                    username = c.User != null ? c.User.Username : "Unknown User",
                    img = c.User != null ? c.User.ProfileImageUrl : null, // طلب يوسف الثاني (صورة اليوزر في الجدول)
                    isFlagged = true,
                    date = c.CreatedAt.ToString("yyyy-MM-dd"), // طلب يوسف الثالث (الفورمات المظبوطة)
                    hateSpeechScore = c.HateSpeechScore,
                    // 🎯 التعديل المطلوب: إرجاع عدد المخالفات الحالي للمستخدم لتسهيل العرض في الفرونت
                    violationCount = c.User != null ? c.User.ViolationCount : 0 
                })
                .OrderByDescending(c => c.hateSpeechScore)
                .ToListAsync();

            return Ok(flaggedComments);
        }

        // ==========================================
        // 4. الحظر المؤقت (Suspend User)
        // ==========================================
        [HttpPut("suspend/{userId}")]
        public async Task<IActionResult> SuspendUser(int userId, [FromBody] SuspendRequest request)
        {
            var userRole = User.FindFirst(ClaimTypes.Role)?.Value;
            if (userRole != "Admin") return Forbid();

            var user = await _context.Users.FindAsync(userId);
            if (user == null) return NotFound("User not found");

            user.IsBanned = true;
            user.BannedUntil = DateTime.UtcNow.AddDays(request.Days);
            user.BanCount++;

            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = $"تم حظر المستخدم {user.Username} لمدة {request.Days} أيام",
                bannedUntil = user.BannedUntil,
                banCount = user.BanCount
            });
        }

        // ==========================================
        // 5. فك الحظر (Unban User)
        // ==========================================
        [HttpPut("unban/{userId}")]
        public async Task<IActionResult> UnbanUser(int userId)
        {
            var userRole = User.FindFirst(ClaimTypes.Role)?.Value;
            if (userRole != "Admin") return Forbid();

            var user = await _context.Users.FindAsync(userId);
            if (user == null) return NotFound("User not found");

            user.IsBanned = false;
            user.BannedUntil = null;

            await _context.SaveChangesAsync();

            return Ok($"User {user.Username} unbanned successfully");
        }

        // ==========================================
        // 6. حذف مستخدم (Delete User)
        // ==========================================
        [HttpDelete("user/{userId}")]
        public async Task<IActionResult> DeleteUser(int userId)
        {
            var userRole = User.FindFirst(ClaimTypes.Role)?.Value;
            if (userRole != "Admin") return Forbid();

            var user = await _context.Users.FindAsync(userId);
            if (user == null) 
            {
                return NotFound(new { message = "User not found in the database system." });
            }

            if (user.Id == 1044)
            {
                return BadRequest("Cannot delete the main admin account");
            }

            var userComments = _context.Comments.Where(c => c.UserId == userId);
            var userLikes = _context.Likes.Where(l => l.UserId == userId);
            
            _context.Comments.RemoveRange(userComments);
            _context.Likes.RemoveRange(userLikes);

            _context.Users.Remove(user);
            await _context.SaveChangesAsync();

            return Ok(new { message = $"User {user.Username} and all associated data have been deleted successfully." });
        }

        // ==========================================
        // 7. حذف كومنت مباشرة بالـ commentId لحساب الداشبورد
        // ==========================================
        [HttpDelete("comment/{commentId}")]
        public async Task<IActionResult> DeleteComment(int commentId)
        {
            var userRole = User.FindFirst(ClaimTypes.Role)?.Value;
            if (userRole != "Admin") return Forbid();

            var comment = await _context.Comments.FindAsync(commentId);

            if (comment == null)
            {
                return NotFound(new { message = "Comment not found or already deleted." });
            }

            _context.Comments.Remove(comment);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Comment deleted successfully from Admin Dashboard." });
        }

        // ==========================================
        // 8. الزر السحري: تصفية كل الداتا عدا حساب الأدمن
        // ==========================================
        [HttpPost("clear-data-except-admin")]
        public async Task<IActionResult> ClearDataExceptAdmin()
        {
            var userRole = User.FindFirst(ClaimTypes.Role)?.Value;
            if (userRole != "Admin") return Forbid();

            try
            {
                _context.Comments.RemoveRange(_context.Comments);
                _context.Likes.RemoveRange(_context.Likes);
               // _context.Posts.RemoveRange(_context.Posts);

                var nonAdminUsers = _context.Users.Where(u => u.Role != "Admin");
                _context.Users.RemoveRange(nonAdminUsers);

                await _context.SaveChangesAsync();

                return Ok(new { message = "All data has been cleared successfully. Admin accounts are safe! ✅" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error while clearing data", error = ex.Message });
            }
        }
    }

    public class SuspendRequest
    {
        public int Days { get; set; }
    }
}