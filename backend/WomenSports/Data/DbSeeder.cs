using BCrypt.Net;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using WomenSports.Data;
using WomenSports.Models;

namespace WomenSports.Data
{
    public static class DbSeeder
    {
        public static async Task SeedAsync(IServiceProvider serviceProvider)
        {
            using var scope = serviceProvider.CreateScope();
            var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();

            // عمل الميجريشن لو مش مسمع
            await context.Database.MigrateAsync();

            // 1. 🎯 ظبط الأدمن بأمان (بدون مسح مستمر)
            const string adminEmail = "admin@womensports.com";
            
            // بنشيك لو الأدمن مش موجود أصلاً في الداتابيز.. ساعتها بس بنضيفه
            var adminExists = await context.Users.AnyAsync(u => u.Email == adminEmail);
            if (!adminExists)
            {
                var admin = new User
                {
                    Username = "Admin",
                    Email = adminEmail,
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin@1234567"),
                    Role = "Admin",
                    CreatedAt = DateTime.UtcNow
                };
                context.Users.Add(admin);
                await context.SaveChangesAsync();
                Console.WriteLine("--- [System] New Admin Created: Admin@1234567 ---");
            }
            else
            {
                Console.WriteLine("--- [System] Admin already exists. Skipping creation. ---");
            }

            // 2. 🎯 تنظيف وتأمين الـ Categories (بدون تدمير بوستات يوسف وبدون بطء)
            var validCategories = new List<string> { "كرة القدم", "السباحة", "السلة", "الجري" };

            // التعديل السريع: بنعمل الفحص جوه الداتابيز مباشرة (بدون AsEnumerable) لحماية السرعة
            // وبنمسح فقط لو البوست ملوش تصنيف خالص أو مكتوب بشكل عشوائي تماماً
            var postsToDelete = await context.Posts
                .Where(p => !validCategories.Contains(p.Category) && (p.Category == null || p.Category == ""))
                .ToListAsync();

            if (postsToDelete.Any())
            {
                context.Posts.RemoveRange(postsToDelete);
                await context.SaveChangesAsync();
                Console.WriteLine($"--- [System] Deleted {postsToDelete.Count} empty/corrupted category posts ---");
            }

            Console.WriteLine("--- [System] DbSeeder finished successfully and safely ✅ ---");
        }
    }
}