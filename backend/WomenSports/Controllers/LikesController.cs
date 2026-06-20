using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using WomenSports.Data;
using WomenSports.Models;

namespace WomenSports.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class LikesController : ControllerBase
    {
        private readonly AppDbContext _context;

        public LikesController(AppDbContext context)
        {
            _context = context;
        }

        // POST toggle like
        [HttpPost("{postId}")]
        public async Task<IActionResult> ToggleLike(int postId)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

            var post = await _context.Posts.FindAsync(postId);
            if (post == null) return NotFound("Post not found");

            var existingLike = await _context.Likes
                .FirstOrDefaultAsync(l => l.UserId == userId && l.PostId == postId);

            if (existingLike != null)
            {
                // Unlike
                _context.Likes.Remove(existingLike);
                await _context.SaveChangesAsync();
                return Ok(new
                {
                    message = "Like removed",
                    isLiked = false,
                    likesCount = await _context.Likes.CountAsync(l => l.PostId == postId)
                });
            }

            // Like
            var like = new Like
            {
                UserId = userId,
                PostId = postId
            };

            _context.Likes.Add(like);
            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Post liked",
                isLiked = true,
                likesCount = await _context.Likes.CountAsync(l => l.PostId == postId)
            });
        }

        // GET likes for a post
        [HttpGet("{postId}")]
        [AllowAnonymous]
        public async Task<IActionResult> GetLikes(int postId)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            var likesCount = await _context.Likes.CountAsync(l => l.PostId == postId);
            bool isLiked = false;

            if (userId != null)
            {
                isLiked = await _context.Likes
                    .AnyAsync(l => l.PostId == postId && l.UserId == int.Parse(userId));
            }

            return Ok(new { likesCount, isLiked });
        }
    }
}