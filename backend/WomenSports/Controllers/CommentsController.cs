using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.ComponentModel.DataAnnotations;
using System.Security.Claims;
using System.Threading.Tasks;
using WomenSports.Data;
using WomenSports.Models;
using WomenSports.Services;

namespace WomenSports.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CommentsController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly AiModerationService _aiService;

        public CommentsController(AppDbContext context, AiModerationService aiService)
        {
            _context = context;
            _aiService = aiService;
        }

        // GET: api/Comments/{postId} (جلب الكومنتات السليمة مع صورة اليوزر)
        [HttpGet("{postId}")]
        public async Task<IActionResult> GetComments(int postId)
        {
            var post = await _context.Posts.FindAsync(postId);
            if (post == null) return NotFound("Post not found");

            var comments = await _context.Comments
                .Include(c => c.User)
                .Where(c => c.PostId == postId && c.IsApproved) // الكومنتات السليمة فقط للعامة
                .Select(c => new
                {
                    c.Id,
                    c.Content,
                    c.CreatedAt,
                    Username = c.User.Username,
                    profileImageUrl = c.User.ProfileImageUrl 
                })
                .OrderByDescending(c => c.CreatedAt)
                .ToListAsync();

            return Ok(comments);
        }

        // POST: api/Comments (إضافة كومنت وفحصه بالـ AI مع حفظ الكومنتات المسيئة)
        [HttpPost]
        [Authorize]
        public async Task<IActionResult> AddComment([FromBody] CreateCommentDTO dto)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
            var userRole = User.FindFirst(ClaimTypes.Role)?.Value;

            var user = await _context.Users.FindAsync(userId);
            if (user == null) return NotFound("User not found");

            // التحقق مما إذا كان المستخدم محظوراً حالياً
            if (user.IsBanned && user.BannedUntil > DateTime.UtcNow)
                return Unauthorized(new
                {
                    message = $"Your account is banned until {user.BannedUntil}",
                    bannedUntil = user.BannedUntil
                });

            // التحقق من وجود البوست
            var post = await _context.Posts.FindAsync(dto.PostId);
            if (post == null) return NotFound("Post not found");

            // فحص الكومنت بالـ AI
            var (isHarmful, label, score) = await _aiService.AnalyzeComment(dto.Content);

            // طباعة النتيجة في الـ Console للمتابعة
            Console.WriteLine($"AI Label: '{label}', Score: '{score}'");

            // ⚠️ حماية الأدمن: لو الكاتب أدمن، بنلغي تصنيف الإساءة تماماً
            if (userRole == "Admin")
            {
                isHarmful = false;
            }

            // ⚠️ لو الكومنت مسيء (Harmful) -> بيسمع فوراً في الداشبورد والـ Counter بيزيد
            if (isHarmful)
            {
                user.ViolationCount++;

                // حفظ الكومنت المسيء في الـ DB كـ مرفوض (IsApproved = false) عشان يظهر في داشبورد الأدمن والـ Counter يحسبه
                var harmfulComment = new Comment
                {
                    Content = dto.Content,
                    PostId = dto.PostId,
                    UserId = userId,
                    IsApproved = false, // مرفوض ولن يظهر في البوست العام وسيظهر في الداشبورد
                    HateSpeechScore = score,
                    CreatedAt = DateTime.UtcNow
                };

                _context.Comments.Add(harmfulComment);

                // حالة التحذير عند المخالفة الرابعة
                if (user.ViolationCount == 4)
                {
                    await _context.SaveChangesAsync();
                    return Ok(new
                    {
                        id = harmfulComment.Id,
                        content = harmfulComment.Content,
                        isFlagged = true,
                        createdAt = harmfulComment.CreatedAt,
                        message = "Warning! If you continue posting inappropriate content your account will be banned",
                        isWarning = true,
                        isBanned = false
                    });
                }

                // حالة البان التلقائي عند المخالفة السابعة أو أكتر
                if (user.ViolationCount >= 7)
                {
                    user.IsBanned = true;
                    user.BannedUntil = DateTime.UtcNow.AddDays(7);
                    user.BanCount++;

                    await _context.SaveChangesAsync();

                    return Ok(new
                    {
                        id = harmfulComment.Id,
                        content = harmfulComment.Content,
                        isFlagged = true,
                        createdAt = harmfulComment.CreatedAt,
                        message = "Your account has been banned for 7 days",
                        isWarning = false,
                        isBanned = true,
                        bannedUntil = user.BannedUntil
                    });
                }

                // للمخالفات الأخرى (1, 2, 3, 5, 6) -> بيتحفظ وبيرجع 200 طبيعي بـ isFlagged = true
                await _context.SaveChangesAsync();
                return Ok(new
                {
                    id = harmfulComment.Id,
                    content = harmfulComment.Content,
                    isFlagged = true,
                    createdAt = harmfulComment.CreatedAt
                });
            }

            // الكومنت سليم (Clean) -> ينشر طبيعي ✅
            var cleanComment = new Comment
            {
                Content = dto.Content,
                PostId = dto.PostId,
                UserId = userId,
                IsApproved = true, // معتمد ويظهر للجميع
                HateSpeechScore = score,
                CreatedAt = DateTime.UtcNow
            };

            _context.Comments.Add(cleanComment);
            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Comment added successfully",
                id = cleanComment.Id,
                content = cleanComment.Content,
                isFlagged = false,
                createdAt = cleanComment.CreatedAt
            });
        }
    }

    public class CreateCommentDTO
    {
        [Required(ErrorMessage = "Content is required")]
        [MinLength(3, ErrorMessage = "Comment must be at least 3 characters")]
        [MaxLength(500, ErrorMessage = "Comment must be less than 500 characters")]
        public string Content { get; set; } = string.Empty;

        [Required(ErrorMessage = "PostId is required")]
        public int PostId { get; set; }
    }
}