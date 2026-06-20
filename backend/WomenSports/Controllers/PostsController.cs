using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;
using System.Security.Claims;
using WomenSports.Data;
using WomenSports.Models;

namespace WomenSports.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PostsController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IWebHostEnvironment _environment;

        public PostsController(AppDbContext context, IWebHostEnvironment environment)
        {
            _context = context;
            _environment = environment;
        }

        // 1. GET all posts + filter + pagination
        [HttpGet]
        public async Task<IActionResult> GetPosts(
            [FromQuery] string? category,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 10)
        {
            if (page < 1) page = 1;
            if (pageSize < 1 || pageSize > 50) pageSize = 10;

            var query = _context.Posts.AsQueryable();

            if (!string.IsNullOrEmpty(category))
                query = query.Where(p => p.Category.ToLower() == category.ToLower());

            var totalPosts = await query.CountAsync();
            var totalPages = (int)Math.Ceiling(totalPosts / (double)pageSize);

            var posts = await query
                .OrderByDescending(p => p.CreatedAt) 
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(p => new
                {
                    Id = p.Id,
                    Title = p.Title,
                    Content = p.Content,
                    ImageUrl = p.ImageUrl,
                    Category = p.Category,
                    CreatedAt = p.CreatedAt,
                    Author = p.User != null ? p.User.Username : "Admin",
                    
                    // قراءة العدادات من الداتابيز مباشرة
                    commentCount = _context.Comments.Count(c => c.PostId == p.Id),
                    likesCount = _context.Likes.Count(l => l.PostId == p.Id)
                })
                .ToListAsync();

            return Ok(new
            {
                currentPage = page,
                totalPages = totalPages,
                totalPosts = totalPosts,
                pageSize = pageSize,
                data = posts
            });
        }

        // 2. GET single post
        [HttpGet("{id}")]
        public async Task<IActionResult> GetPost(int id)
        {
            var post = await _context.Posts
                .Where(p => p.Id == id)
                .Select(p => new
                {
                    Id = p.Id,
                    Title = p.Title,
                    Content = p.Content,
                    ImageUrl = p.ImageUrl,
                    Category = p.Category,
                    CreatedAt = p.CreatedAt,
                    Author = p.User != null ? p.User.Username : "Admin",
                    
                    // قراءة العدادات للبوست الفردي
                    commentCount = _context.Comments.Count(c => c.PostId == p.Id),
                    likesCount = _context.Likes.Count(l => l.PostId == p.Id)
                })
                .FirstOrDefaultAsync();

            if (post == null) return NotFound(new { message = "Post not found" });

            return Ok(post);
        }

        // 3. POST: Create Post
        [HttpPost]
        [Authorize]
        public async Task<IActionResult> CreatePost([FromForm] CreatePostDTO dto, IFormFile? image)
        {
            var userRole = User.FindFirst(ClaimTypes.Role)?.Value;
            if (userRole != "Admin")
                return Forbid();

            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
            {
                return Unauthorized(new { message = "Invalid user token." });
            }

            var userExists = await _context.Users.AnyAsync(u => u.Id == userId);
            if (!userExists)
            {
                return BadRequest(new { message = $"The user with ID {userId} does not exist." });
            }

            string? finalImageUrl = null;

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
                finalImageUrl = $"{Request.Scheme}://{Request.Host}/uploads/{fileName}";
            }

            var formattedCategory = char.ToUpper(dto.Category[0]) + dto.Category.Substring(1).ToLower();

            var post = new Post
            {
                Title = dto.Title,
                Content = dto.Content,
                ImageUrl = finalImageUrl ?? dto.ImageUrl, 
                Category = formattedCategory,
                UserId = userId,
                CreatedAt = DateTime.UtcNow
            };

            _context.Posts.Add(post);
            await _context.SaveChangesAsync();

            return Ok(new { 
                id = post.Id, 
                title = post.Title, 
                content = post.Content,
                imageUrl = post.ImageUrl, 
                category = post.Category,
                createdAt = post.CreatedAt,
                author = User.FindFirst(ClaimTypes.Name)?.Value ?? "Admin",
                commentCount = 0,
                likesCount = 0
            });
        }

        // 4. PUT: Update Post
        [HttpPut("{id}")]
        [Authorize]
        public async Task<IActionResult> UpdatePost(int id, [FromForm] UpdatePostDTO dto, IFormFile? image)
        {
            var userRole = User.FindFirst(ClaimTypes.Role)?.Value;
            if (userRole != "Admin")
                return Forbid();

            var post = await _context.Posts.FirstOrDefaultAsync(p => p.Id == id);
            if (post == null) 
                return NotFound(new { message = "Post not found" });

            string? finalImageUrl = post.ImageUrl;

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
                finalImageUrl = $"{Request.Scheme}://{Request.Host}/uploads/{fileName}";
            }
            else if (!string.IsNullOrEmpty(dto.ImageUrl))
            {
                finalImageUrl = dto.ImageUrl;
            }

            if (!string.IsNullOrEmpty(dto.Category))
            {
                post.Category = char.ToUpper(dto.Category[0]) + dto.Category.Substring(1).ToLower();
            }

            post.Title = dto.Title;
            post.Content = dto.Content;
            post.ImageUrl = finalImageUrl;

            await _context.SaveChangesAsync();

            var currentCommentCount = await _context.Comments.CountAsync(c => c.PostId == post.Id);
            var currentLikesCount = await _context.Likes.CountAsync(l => l.PostId == post.Id);

            return Ok(new { 
                message = "Post updated successfully",
                id = post.Id,
                title = post.Title,
                content = post.Content,
                category = post.Category,
                imageUrl = post.ImageUrl,
                createdAt = post.CreatedAt,
                commentCount = currentCommentCount,
                likesCount = currentLikesCount
            });
        }

        // 5. DELETE: Delete Post
        [HttpDelete("{id}")]
        [Authorize]
        public async Task<IActionResult> DeletePost(int id)
        {
            var userRole = User.FindFirst(ClaimTypes.Role)?.Value;
            if (userRole != "Admin")
                return Forbid();

            var post = await _context.Posts.FindAsync(id);
            if (post == null) return NotFound(new { message = "Post not found" });

            _context.Posts.Remove(post);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Post deleted successfully" });
        }
    }

    public class CreatePostDTO
    {
        [Required(ErrorMessage = "Title is required")]
        [MinLength(5, ErrorMessage = "Title must be at least 5 characters")]
        [MaxLength(200, ErrorMessage = "Title must be less than 200 characters")]
        public string Title { get; set; } = string.Empty;

        [Required(ErrorMessage = "Content is required")]
        [MinLength(10, ErrorMessage = "Content must be at least 10 characters")]
        public string Content { get; set; } = string.Empty;

        public string? ImageUrl { get; set; }

        [Required(ErrorMessage = "Category is required")]
        public string Category { get; set; } = string.Empty;
    }

    public class UpdatePostDTO
    {
        [Required(ErrorMessage = "Title is required")]
        [MinLength(5, ErrorMessage = "Title must be at least 5 characters")]
        [MaxLength(200, ErrorMessage = "Title must be less than 200 characters")]
        public string Title { get; set; } = string.Empty;

        [Required(ErrorMessage = "Content is required")]
        [MinLength(10, ErrorMessage = "Content must be at least 10 characters")]
        public string Content { get; set; } = string.Empty;

        public string? ImageUrl { get; set; }

        [Required(ErrorMessage = "Category is required")]
        public string Category { get; set; } = string.Empty;
    }
}