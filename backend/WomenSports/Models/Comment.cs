using System;

namespace WomenSports.Models
{
    public class Comment
    {
        public int Id { get; set; }
        public string Content { get; set; } = string.Empty;
        
        // الحقل المعتمد عندك: لو الكومنت سليم بيبقى true، لو مسيء (Hate Speech) الأدمن بيخليه false
        public bool IsApproved { get; set; } = false;

        // الحقل المعتمد عندك لتخزين نسبة الإساءة من الـ AI
        public double HateSpeechScore { get; set; } = 0;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // العلاقة مع يوزر
        public int UserId { get; set; }
        public User User { get; set; } = null!;

        // العلاقة مع بوست
        public int PostId { get; set; }
        public Post Post { get; set; } = null!;
    }
}