using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using System.Text;
using WomenSports.Data;
using WomenSports.Services;

var builder = WebApplication.CreateBuilder(args);

// 1. Database
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// 2. JWT Authentication
var jwtKey = builder.Configuration["Jwt:Key"]!;
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidAudience = builder.Configuration["Jwt:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey))
        };
    });

// 3. CORS Setup (مفتوح بالكامل للكل: Vercel, Localhost, Ngrok وأي دومين آخر)
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAngular", policy =>
    {
        policy.SetIsOriginAllowed(origin => true) // يسمح بجميع الدومينات بلا استثناء وديناميكياً
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials(); // يمنع خطأ الـ fetch والـ CORS تماماً مع Angular
    });
});

builder.Services.AddControllers(options =>
{
    options.Filters.Add<WomenSports.Filters.ValidationFilter>();
});

builder.Services.AddHttpClient<AiModerationService>();
builder.Services.AddEndpointsApiExplorer();

// 4. Swagger Setup
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "WomenSports API", Version = "v1" });
    
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "JWT Authorization header using the Bearer scheme. Example: \"Bearer {token}\"",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT"
    });

    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            new string[] { }
        }
    });
});

var app = builder.Build();

// --- حل المسارات والصور المتوافق مع الاستضافة أونلاين ومحلي ---
using (var scope = app.Services.CreateScope())
{
    var env = app.Environment;
    var webRootPath = env.WebRootPath ?? Path.Combine(AppContext.BaseDirectory, "wwwroot");
    var uploadsPath = Path.Combine(webRootPath, "uploads");

    if (!Directory.Exists(uploadsPath))
    {
        Directory.CreateDirectory(uploadsPath);
        Console.WriteLine($"[System] Created missing directory: {uploadsPath}");
    }
}
// -----------------------------------------------------------

// --- حماية الـ Seeder بـ try-catch عشان لو الـ SQL مقفول على جهازك الـ API ما يقعش ---
try
{
    if (app.Environment.IsDevelopment())
    {
        await DbSeeder.SeedAsync(app.Services);
    }
}
catch (Exception ex)
{
    Console.WriteLine($"[Warning] SQL Server connection failed locally, skipping seeding: {ex.Message}");
}

// --- تفعيل الـ Swagger على السيرفر بمسار نسبي بدون 404 ---
app.UseSwagger();
app.UseSwaggerUI(c =>
{
    c.SwaggerEndpoint("v1/swagger.json", "WomenSports API v1");
    c.RoutePrefix = "swagger"; 
});

// --- ترتيب الـ Middlewares ---

app.UseHttpsRedirection(); // ✅ الأول

app.UseCors("AllowAngular"); // ✅ قبل Authentication

app.UseStaticFiles();

app.UseMiddleware<WomenSports.Middleware.ExceptionMiddleware>();

app.UseAuthentication();

app.UseAuthorization();

app.MapControllers();

app.Run();