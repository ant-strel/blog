using Blog.Api.Contracts.Admin;
using Blog.Api.Contracts.Public;
using Blog.Api.Data;
using Blog.Api.Entities;
using Microsoft.EntityFrameworkCore;

namespace Blog.Api.Services;

public class BlogArticleService : IBlogArticleService
{
    private readonly BlogDbContext _dbContext;

    public BlogArticleService(BlogDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<PublicArticleListResponse> GetPublishedArticlesAsync(
        string? search,
        string? tag,
        CancellationToken cancellationToken)
    {
        IQueryable<BlogArticle> query = _dbContext.Articles.Where(article => article.Status == "published");

        if (!string.IsNullOrWhiteSpace(search))
        {
            var needle = search.Trim().ToLowerInvariant();
            query = query.Where(article =>
                article.Title.ToLower().Contains(needle) ||
                article.Excerpt.ToLower().Contains(needle) ||
                article.Content.ToLower().Contains(needle));
        }

        if (!string.IsNullOrWhiteSpace(tag))
        {
            var normalizedTag = tag.Trim().ToLowerInvariant();
            query = query.Where(article => article.Tags.Any(item => item.ToLower() == normalizedTag));
        }

        var items = await query
            .OrderByDescending(article => article.PublishedAtUtc)
            .Select(article => new PublicArticleSummaryResponse
            {
                Id = article.Id,
                Slug = article.Slug,
                Title = article.Title,
                Excerpt = article.Excerpt,
                Author = article.Author,
                Tags = article.Tags,
                PublishedAtUtc = article.PublishedAtUtc ?? article.UpdatedAtUtc
            })
            .ToListAsync(cancellationToken);

        return new PublicArticleListResponse
        {
            Items = items,
            Total = items.Count
        };
    }

    public async Task<PublicArticleResponse?> GetPublishedArticleBySlugAsync(string slug, CancellationToken cancellationToken)
    {
        return await _dbContext.Articles
            .Where(article => article.Status == "published" && article.Slug == slug)
            .Select(article => new PublicArticleResponse
            {
                Id = article.Id,
                Slug = article.Slug,
                Title = article.Title,
                Excerpt = article.Excerpt,
                Content = article.Content,
                Author = article.Author,
                Tags = article.Tags,
                PublishedAtUtc = article.PublishedAtUtc ?? article.UpdatedAtUtc
            })
            .SingleOrDefaultAsync(cancellationToken);
    }

    public async Task<IList<BlogArticleAdminResponse>> GetAdminArticlesAsync(string? status, CancellationToken cancellationToken)
    {
        IQueryable<BlogArticle> query = _dbContext.Articles;
        if (!string.IsNullOrWhiteSpace(status))
        {
            query = query.Where(article => article.Status == status);
        }

        return await query
            .OrderByDescending(article => article.UpdatedAtUtc)
            .Select(article => new BlogArticleAdminResponse
            {
                Id = article.Id,
                Slug = article.Slug,
                Title = article.Title,
                Excerpt = article.Excerpt,
                Content = article.Content,
                Author = article.Author,
                Status = article.Status,
                Tags = article.Tags,
                CreatedAtUtc = article.CreatedAtUtc,
                UpdatedAtUtc = article.UpdatedAtUtc,
                PublishedAtUtc = article.PublishedAtUtc
            })
            .ToListAsync(cancellationToken);
    }

    public async Task<BlogArticleAdminResponse?> GetAdminArticleByIdAsync(Guid id, CancellationToken cancellationToken)
    {
        return await _dbContext.Articles
            .Where(article => article.Id == id)
            .Select(article => new BlogArticleAdminResponse
            {
                Id = article.Id,
                Slug = article.Slug,
                Title = article.Title,
                Excerpt = article.Excerpt,
                Content = article.Content,
                Author = article.Author,
                Status = article.Status,
                Tags = article.Tags,
                CreatedAtUtc = article.CreatedAtUtc,
                UpdatedAtUtc = article.UpdatedAtUtc,
                PublishedAtUtc = article.PublishedAtUtc
            })
            .SingleOrDefaultAsync(cancellationToken);
    }

    public async Task<BlogArticleAdminResponse> CreateAsync(CreateBlogArticleRequest request, CancellationToken cancellationToken)
    {
        if (await _dbContext.Articles.AnyAsync(article => article.Slug == request.Slug, cancellationToken))
        {
            throw new InvalidOperationException("Slug is already in use.");
        }

        var article = new BlogArticle
        {
            Id = Guid.NewGuid(),
            Slug = request.Slug.Trim(),
            Title = request.Title.Trim(),
            Excerpt = request.Excerpt.Trim(),
            Content = request.Content.Trim(),
            Author = request.Author.Trim(),
            Tags = request.Tags.Select(tag => tag.Trim()).Where(tag => tag.Length > 0).Distinct().ToArray(),
            Status = "draft",
            CreatedAtUtc = DateTime.UtcNow,
            UpdatedAtUtc = DateTime.UtcNow
        };

        _dbContext.Articles.Add(article);
        await _dbContext.SaveChangesAsync(cancellationToken);
        return MapAdmin(article);
    }

    public async Task<BlogArticleAdminResponse?> UpdateAsync(Guid id, UpdateBlogArticleRequest request, CancellationToken cancellationToken)
    {
        var article = await _dbContext.Articles.SingleOrDefaultAsync(item => item.Id == id, cancellationToken);
        if (article is null)
        {
            return null;
        }

        var slugInUse = await _dbContext.Articles.AnyAsync(
            item => item.Id != id && item.Slug == request.Slug,
            cancellationToken);

        if (slugInUse)
        {
            throw new InvalidOperationException("Slug is already in use.");
        }

        article.Slug = request.Slug.Trim();
        article.Title = request.Title.Trim();
        article.Excerpt = request.Excerpt.Trim();
        article.Content = request.Content.Trim();
        article.Author = request.Author.Trim();
        article.Tags = request.Tags.Select(tag => tag.Trim()).Where(tag => tag.Length > 0).Distinct().ToArray();
        article.UpdatedAtUtc = DateTime.UtcNow;

        await _dbContext.SaveChangesAsync(cancellationToken);
        return MapAdmin(article);
    }

    public async Task<ArticleStateChangeResponse?> PublishAsync(Guid id, CancellationToken cancellationToken)
    {
        var article = await _dbContext.Articles.SingleOrDefaultAsync(item => item.Id == id, cancellationToken);
        if (article is null)
        {
            return null;
        }

        article.Status = "published";
        article.PublishedAtUtc ??= DateTime.UtcNow;
        article.UpdatedAtUtc = DateTime.UtcNow;

        await _dbContext.SaveChangesAsync(cancellationToken);
        return MapState(article);
    }

    public async Task<ArticleStateChangeResponse?> ArchiveAsync(Guid id, CancellationToken cancellationToken)
    {
        var article = await _dbContext.Articles.SingleOrDefaultAsync(item => item.Id == id, cancellationToken);
        if (article is null)
        {
            return null;
        }

        article.Status = "archived";
        article.UpdatedAtUtc = DateTime.UtcNow;

        await _dbContext.SaveChangesAsync(cancellationToken);
        return MapState(article);
    }

    public async Task<bool> DeleteAsync(Guid id, CancellationToken cancellationToken)
    {
        var article = await _dbContext.Articles.SingleOrDefaultAsync(item => item.Id == id, cancellationToken);
        if (article is null)
        {
            return false;
        }

        _dbContext.Articles.Remove(article);
        await _dbContext.SaveChangesAsync(cancellationToken);
        return true;
    }

    private static BlogArticleAdminResponse MapAdmin(BlogArticle article) => new()
    {
        Id = article.Id,
        Slug = article.Slug,
        Title = article.Title,
        Excerpt = article.Excerpt,
        Content = article.Content,
        Author = article.Author,
        Status = article.Status,
        Tags = article.Tags,
        CreatedAtUtc = article.CreatedAtUtc,
        UpdatedAtUtc = article.UpdatedAtUtc,
        PublishedAtUtc = article.PublishedAtUtc
    };

    private static ArticleStateChangeResponse MapState(BlogArticle article)
    {
        return new ArticleStateChangeResponse
        {
            Id = article.Id,
            Status = article.Status,
            UpdatedAtUtc = article.UpdatedAtUtc,
            PublishedAtUtc = article.PublishedAtUtc
        };
    }
}
