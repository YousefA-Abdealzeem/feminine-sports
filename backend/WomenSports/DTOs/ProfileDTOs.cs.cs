using System.ComponentModel.DataAnnotations;

namespace WomenSports.DTOs
{
    // الـ DTO اللي بيرجع بيانات البروفايل (للقراءة فقط)
    // ده اللي السيرفر بيبعته ليوسف عشان يعرض البيانات
    public class ProfileDTO
    {
        public string Username { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string? Bio { get; set; }
        public string? FavoriteSports { get; set; }
        public string? PhoneNumber { get; set; }
        public string? ProfileImageUrl { get; set; }
        public DateTime CreatedAt { get; set; }
        public int CommentCount { get; set; }
        public int ViolationCount { get; set; }
        public bool IsBanned { get; set; }
    }

    // الـ DTO اللي بيستقبل التعديلات من يوسف
    // ملاحظة: لازم يتبعت من الأنجيولار كـ Multipart FormData
    public class UpdateProfileDTO
    {
        [MinLength(3, ErrorMessage = "Username must be at least 3 characters")]
        public string? Username { get; set; }

        [EmailAddress(ErrorMessage = "Invalid email format")]
        public string? Email { get; set; }

        [MinLength(8, ErrorMessage = "Password must be at least 8 characters")]
        [RegularExpression(@"^(?=.*[A-Z])(?=.*\d).+$",
            ErrorMessage = "Password must contain at least one uppercase letter and one number")]
        public string? Password { get; set; }

        [Compare("Password", ErrorMessage = "Passwords do not match")]
        public string? ConfirmPassword { get; set; } 

        [MaxLength(500, ErrorMessage = "Bio must be less than 500 characters")]
        public string? Bio { get; set; }

        public string? FavoriteSports { get; set; }

        [RegularExpression(@"^01[0125][0-9]{8}$",
            ErrorMessage = "Invalid Egyptian phone number format")]
        public string? PhoneNumber { get; set; }

        // تم حذف ProfileImageUrl من هنا تماماً عشان نمنع الـ API من استلام قيمة null ومسح الصورة القديمة
    }
}