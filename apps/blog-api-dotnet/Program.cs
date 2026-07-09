using Blog.Api.Data;
using Blog.Api.Entities;
using Blog.Api.Extensions;
using Blog.Api.Options;
using Blog.Api.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

builder.Logging.ClearProviders();
builder.Logging.AddConsole();

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddProblemDetails();
builder.Services.AddApiBehavior();

builder.Services.Configure<JwtOptions>(builder.Configuration.GetSection(JwtOptions.SectionName));
builder.Services.Configure<CorsOptions>(builder.Configuration.GetSection(CorsOptions.SectionName));
builder.Services.Configure<BlogExportOptions>(builder.Configuration.GetSection(BlogExportOptions.SectionName));

var jwtOptions = builder.Configuration.GetSection(JwtOptions.SectionName).Get<JwtOptions>()
    ?? throw new InvalidOperationException("Jwt settings were not found.");
var databaseProvider = builder.Configuration["Database:Provider"] ?? "Sqlite";
var normalizedDatabaseProvider = databaseProvider.ToLowerInvariant();
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection")
    ?? throw new InvalidOperationException("ConnectionStrings:DefaultConnection is not configured.");

if (string.IsNullOrWhiteSpace(jwtOptions.SecretKey))
{
    throw new InvalidOperationException("Jwt:SecretKey is not configured.");
}

builder.Services.AddDbContext<BlogDbContext>(options =>
{
    switch (normalizedDatabaseProvider)
    {
        case "postgres":
        case "postgresql":
            options.UseNpgsql(connectionString);
            break;
        case "sqlite":
            options.UseSqlite(connectionString);
            break;
        default:
            throw new InvalidOperationException($"Unsupported database provider '{databaseProvider}'.");
    }
});

builder.Services
    .AddAuthentication(options =>
    {
        options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
        options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
        options.DefaultScheme = JwtBearerDefaults.AuthenticationScheme;
    })
    .AddJwtBearer(options =>
    {
        options.RequireHttpsMetadata = false;
        options.SaveToken = false;
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidIssuer = jwtOptions.Issuer,
            ValidateAudience = true,
            ValidAudience = jwtOptions.Audience,
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtOptions.SecretKey)),
            RequireExpirationTime = true,
            ValidateLifetime = true,
            ClockSkew = TimeSpan.FromSeconds(30)
        };
    });

builder.Services.AddAuthorization();

var corsOptions = builder.Configuration.GetSection(CorsOptions.SectionName).Get<CorsOptions>() ?? new CorsOptions();
const string corsPolicyName = "FrontendOrigins";
builder.Services.AddCors(options =>
{
    options.AddPolicy(corsPolicyName, policy =>
    {
        if (corsOptions.AllowedOrigins.Length > 0)
        {
            policy.WithOrigins(corsOptions.AllowedOrigins)
                .AllowAnyMethod()
                .AllowAnyHeader();
        }
    });
});

builder.Services.AddScoped<IBlogArticleService, BlogArticleService>();
builder.Services.AddScoped<IArticleMarkdownExportService, ArticleMarkdownExportService>();
builder.Services.AddScoped<IArticleMarkdownImportService, ArticleMarkdownImportService>();
builder.Services.AddScoped<IBlogSeeder, BlogSeeder>();
builder.Services.AddHealthChecks().AddCheck<BlogHealthCheck>("blog-store");

builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "Template Project Blog API",
        Version = "v1",
        Description = "Standalone blog/article API with protected editing and public article surfaces."
    });

    var securityScheme = new OpenApiSecurityScheme
    {
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT",
        Description = "JWT Authorization header using the Bearer scheme."
    };

    options.AddSecurityDefinition(JwtBearerDefaults.AuthenticationScheme, securityScheme);
    options.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        [securityScheme] = []
    });
});

var app = builder.Build();

app.UseExceptionHandler();
app.UseSwagger();
app.UseSwaggerUI();
app.UseHttpsRedirection();
app.UseCors(corsPolicyName);
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();
app.MapHealthChecks("/health");

using (var scope = app.Services.CreateScope())
{
    var dbContext = scope.ServiceProvider.GetRequiredService<BlogDbContext>();
    switch (normalizedDatabaseProvider)
    {
        case "postgres":
        case "postgresql":
            await dbContext.Database.MigrateAsync();
            break;
        case "sqlite":
            await dbContext.Database.EnsureCreatedAsync();
            break;
        default:
            throw new InvalidOperationException($"Unsupported database provider '{databaseProvider}'.");
    }

    var seeder = scope.ServiceProvider.GetRequiredService<IBlogSeeder>();
    await seeder.SeedAsync();
}

app.Run();

namespace Blog.Api
{
    public partial class Program;
}
