using Blog.Api.Data;
using Blog.Api.Entities;
using Microsoft.EntityFrameworkCore;

namespace Blog.Api.Services;

public class BlogSeeder : IBlogSeeder
{
    private readonly BlogDbContext _dbContext;

    public BlogSeeder(BlogDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task SeedAsync(CancellationToken cancellationToken = default)
    {
        if (await _dbContext.Articles.AnyAsync(cancellationToken))
        {
            return;
        }

        var now = DateTime.UtcNow;
        _dbContext.Articles.AddRange(
            new BlogArticle
            {
                Id = Guid.NewGuid(),
                Slug = "react-auth-perimeter",
                Title = "React auth perimeter for the first platform slice",
                Excerpt = "How public, account and admin shells share one JWT session model.",
                Content = "The first slice keeps auth JWT-first, moves API calls behind typed clients, and aligns route guards across shells.",
                Author = "Anton Strelkov",
                Tags = ["react", "auth", "jwt"],
                Status = "published",
                CreatedAtUtc = now.AddDays(-10),
                UpdatedAtUtc = now.AddDays(-9),
                PublishedAtUtc = now.AddDays(-9)
            },
            new BlogArticle
            {
                Id = Guid.NewGuid(),
                Slug = "blog-boundary-editor-later",
                Title = "Blog first, editor later",
                Excerpt = "Public blog surfaces belong in the first slice. Rich authoring does not.",
                Content = "Landing pages remain config-driven while articles alone cross into editor-backed territory.",
                Author = "Anton Strelkov",
                Tags = ["blog", "content", "architecture"],
                Status = "published",
                CreatedAtUtc = now.AddDays(-5),
                UpdatedAtUtc = now.AddDays(-4),
                PublishedAtUtc = now.AddDays(-4)
            },
            new BlogArticle
            {
                Id = Guid.NewGuid(),
                Slug = "draft-editor-entrypoint",
                Title = "Draft editor entrypoint",
                Excerpt = "Protected drafts live behind auth and stay out of the public site by default.",
                Content = "This draft exists only to validate the auth guard and content boundary.",
                Author = "Editorial Owner",
                Tags = ["drafts", "editor"],
                Status = "draft",
                CreatedAtUtc = now.AddDays(-1),
                UpdatedAtUtc = now
            });

        await _dbContext.SaveChangesAsync(cancellationToken);
    }
}
