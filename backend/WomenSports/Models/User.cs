using System;
using System.Collections.Generic;

namespace WomenSports.Models
{
    public class User
    {
        public int Id { get; set; }
        public string Username { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string PasswordHash { get; set; } = string.Empty;
        public string Role { get; set; } = "User"; // قيمتها بتكون "User" أو "Admin"
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // عداد المخالفات: بيزيد 1 مع كل كومنت مسيء يقفشه الـ AI
        public int ViolationCount { get; set; } = 0;

        // حالة الحظر: بتقلب true لو الأدمن حظره أو لو وصل للحد الأقصى للمخالفات
        public bool IsBanned { get; set; } = false;

        // وقت انتهاء الحظر (اختياري لو حابب تعمل حظر مؤقت)
        public DateTime? BannedUntil { get; set; }

        public string? Bio { get; set; }
        public string? FavoriteSports { get; set; }
        
        // عداد كم مرة اليوزر ده أخد بان جوه السيستم
        public int BanCount { get; set; } = 0;

        // رقم الهاتف (اللي اتأكدنا إن يوسف هيربطه صح في الفرونت إند)
        public string? PhoneNumber { get; set; }

        // رابط صورة البروفايل: اللي الباك إند هيرجعها مع الكومنتات وفي الداشبورد
        public string? ProfileImageUrl { get; set; }

        // ⚠️ التعديل الجديد: رابط صورة الكفر (الغلاف) عشان تتسيف في الـ DB وماتروحش لما تطلع وتدخل ثاني
        public string? ProfileCoverUrl { get; set; }

        // --- العلاقات (Relationships) مع الجداول الأخرى ---
        
        // البوستات اللي اليوزر ده كتبها
        public ICollection<Post> Posts { get; set; } = new List<Post>();
        
        // الكومنتات اللي اليوزر ده كتبها (سواء سليمة أو flagged)
        public ICollection<Comment> Comments { get; set; } = new List<Comment>();
        
        // اللايكات اللي اليوزر ده عملها على البوستات
        public ICollection<Like> Likes { get; set; } = new List<Like>();
    }
}