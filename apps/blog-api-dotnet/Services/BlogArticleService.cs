using Blog.Api.Contracts.Admin;
using Blog.Api.Contracts.Public;
using Blog.Api.Data;
using Blog.Api.Entities;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;

namespace Blog.Api.Services;

public class BlogArticleService : IBlogArticleService
{
    private static readonly string[] AllowedVariantStatuses = ["draft", "ready", "published", "archived"];
    private static readonly string[] AllowedVariantExportFormats = ["markdown", "html", "plain", "telegram_html"];

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
                Title = DeserializeLocalizedText(article.Title),
                Excerpt = DeserializeLocalizedText(article.Excerpt),
                Author = article.Author,
                Tags = article.Tags,
                PublishedAtUtc = article.PublishedAtUtc ?? article.UpdatedAtUtc,
                UpdatedAtUtc = article.UpdatedAtUtc
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
                Title = DeserializeLocalizedText(article.Title),
                Excerpt = DeserializeLocalizedText(article.Excerpt),
                Content = DeserializeLocalizedText(article.Content),
                Author = article.Author,
                Tags = article.Tags,
                PublishedAtUtc = article.PublishedAtUtc ?? article.UpdatedAtUtc,
                UpdatedAtUtc = article.UpdatedAtUtc
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
                Title = DeserializeLocalizedText(article.Title),
                Excerpt = DeserializeLocalizedText(article.Excerpt),
                Content = DeserializeLocalizedText(article.Content),
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
                Title = DeserializeLocalizedText(article.Title),
                Excerpt = DeserializeLocalizedText(article.Excerpt),
                Content = DeserializeLocalizedText(article.Content),
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
            Title = SerializeLocalizedText(request.Title),
            Excerpt = SerializeLocalizedText(request.Excerpt),
            Content = SerializeLocalizedText(request.Content),
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
        article.Title = SerializeLocalizedText(request.Title);
        article.Excerpt = SerializeLocalizedText(request.Excerpt);
        article.Content = SerializeLocalizedText(request.Content);
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

    public async Task<IList<ArticlePublicationVariantResponse>?> GetPublicationVariantsAsync(
        Guid articleId,
        CancellationToken cancellationToken)
    {
        if (!await _dbContext.Articles.AnyAsync(article => article.Id == articleId, cancellationToken))
        {
            return null;
        }

        return await _dbContext.PublicationVariants
            .Where(variant => variant.ArticleId == articleId)
            .OrderBy(variant => variant.Platform)
            .ThenBy(variant => variant.Locale)
            .Select(variant => MapPublicationVariant(variant))
            .ToListAsync(cancellationToken);
    }

    public async Task<ArticlePublicationVariantResponse?> GetPublicationVariantAsync(
        Guid articleId,
        Guid variantId,
        CancellationToken cancellationToken)
    {
        return await _dbContext.PublicationVariants
            .Where(variant => variant.ArticleId == articleId && variant.Id == variantId)
            .Select(variant => MapPublicationVariant(variant))
            .SingleOrDefaultAsync(cancellationToken);
    }

    public async Task<ArticlePublicationVariantResponse?> CreatePublicationVariantAsync(
        Guid articleId,
        CreateArticlePublicationVariantRequest request,
        CancellationToken cancellationToken)
    {
        if (!await _dbContext.Articles.AnyAsync(article => article.Id == articleId, cancellationToken))
        {
            return null;
        }

        var platform = NormalizeRequiredToken(request.Platform, "Platform");
        var locale = NormalizeRequiredToken(request.Locale, "Locale");
        var status = NormalizeVariantStatus(request.Status);
        var exportFormat = NormalizeExportFormat(request.ExportFormat);
        var duplicate = await _dbContext.PublicationVariants.AnyAsync(
            variant => variant.ArticleId == articleId && variant.Platform == platform && variant.Locale == locale,
            cancellationToken);

        if (duplicate)
        {
            throw new InvalidOperationException("Publication variant already exists for this platform and locale.");
        }

        var now = DateTime.UtcNow;
        var variant = new ArticlePublicationVariant
        {
            Id = Guid.NewGuid(),
            ArticleId = articleId,
            Platform = platform,
            Locale = locale,
            Title = NormalizeRequiredText(request.Title, "Title"),
            Excerpt = request.Excerpt.Trim(),
            ContentMarkdown = NormalizeRequiredText(request.ContentMarkdown, "Content"),
            ExportFormat = exportFormat,
            Status = status,
            ExternalUrl = NormalizeOptionalText(request.ExternalUrl),
            Notes = NormalizeOptionalText(request.Notes),
            CreatedAtUtc = now,
            UpdatedAtUtc = now,
            PublishedAtUtc = status == "published" ? now : null
        };

        _dbContext.PublicationVariants.Add(variant);
        await _dbContext.SaveChangesAsync(cancellationToken);
        return MapPublicationVariant(variant);
    }

    public async Task<ArticlePublicationVariantResponse?> UpdatePublicationVariantAsync(
        Guid articleId,
        Guid variantId,
        UpdateArticlePublicationVariantRequest request,
        CancellationToken cancellationToken)
    {
        var variant = await _dbContext.PublicationVariants.SingleOrDefaultAsync(
            item => item.ArticleId == articleId && item.Id == variantId,
            cancellationToken);

        if (variant is null)
        {
            return null;
        }

        var platform = NormalizeRequiredToken(request.Platform, "Platform");
        var locale = NormalizeRequiredToken(request.Locale, "Locale");
        var duplicate = await _dbContext.PublicationVariants.AnyAsync(
            item => item.ArticleId == articleId && item.Id != variantId && item.Platform == platform && item.Locale == locale,
            cancellationToken);

        if (duplicate)
        {
            throw new InvalidOperationException("Publication variant already exists for this platform and locale.");
        }

        var status = NormalizeVariantStatus(request.Status);
        variant.Platform = platform;
        variant.Locale = locale;
        variant.Title = NormalizeRequiredText(request.Title, "Title");
        variant.Excerpt = request.Excerpt.Trim();
        variant.ContentMarkdown = NormalizeRequiredText(request.ContentMarkdown, "Content");
        variant.ExportFormat = NormalizeExportFormat(request.ExportFormat);
        variant.Status = status;
        variant.ExternalUrl = NormalizeOptionalText(request.ExternalUrl);
        variant.Notes = NormalizeOptionalText(request.Notes);
        variant.UpdatedAtUtc = DateTime.UtcNow;
        if (status == "published")
        {
            variant.PublishedAtUtc ??= variant.UpdatedAtUtc;
        }

        await _dbContext.SaveChangesAsync(cancellationToken);
        return MapPublicationVariant(variant);
    }

    public async Task<bool?> DeletePublicationVariantAsync(
        Guid articleId,
        Guid variantId,
        CancellationToken cancellationToken)
    {
        if (!await _dbContext.Articles.AnyAsync(article => article.Id == articleId, cancellationToken))
        {
            return null;
        }

        var variant = await _dbContext.PublicationVariants.SingleOrDefaultAsync(
            item => item.ArticleId == articleId && item.Id == variantId,
            cancellationToken);

        if (variant is null)
        {
            return false;
        }

        _dbContext.PublicationVariants.Remove(variant);
        await _dbContext.SaveChangesAsync(cancellationToken);
        return true;
    }

    private static BlogArticleAdminResponse MapAdmin(BlogArticle article) => new()
    {
        Id = article.Id,
        Slug = article.Slug,
        Title = DeserializeLocalizedText(article.Title),
        Excerpt = DeserializeLocalizedText(article.Excerpt),
        Content = DeserializeLocalizedText(article.Content),
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

    private static ArticlePublicationVariantResponse MapPublicationVariant(ArticlePublicationVariant variant) => new()
    {
        Id = variant.Id,
        ArticleId = variant.ArticleId,
        Platform = variant.Platform,
        Locale = variant.Locale,
        Title = variant.Title,
        Excerpt = variant.Excerpt,
        ContentMarkdown = variant.ContentMarkdown,
        ExportFormat = variant.ExportFormat,
        Status = variant.Status,
        ExternalUrl = variant.ExternalUrl,
        Notes = variant.Notes,
        CreatedAtUtc = variant.CreatedAtUtc,
        UpdatedAtUtc = variant.UpdatedAtUtc,
        PublishedAtUtc = variant.PublishedAtUtc
    };

    private static string NormalizeRequiredText(string value, string fieldName)
    {
        var normalized = value.Trim();
        if (normalized.Length == 0)
        {
            throw new InvalidOperationException($"{fieldName} is required.");
        }

        return normalized;
    }

    private static string NormalizeRequiredToken(string value, string fieldName)
    {
        var normalized = NormalizeRequiredText(value, fieldName).ToLowerInvariant();
        if (normalized.Any(character => !(char.IsAsciiLetterOrDigit(character) || character == '_' || character == '-')))
        {
            throw new InvalidOperationException($"{fieldName} can contain only letters, digits, dashes and underscores.");
        }

        return normalized;
    }

    private static string NormalizeVariantStatus(string value)
    {
        var normalized = NormalizeRequiredToken(value, "Status");
        if (!AllowedVariantStatuses.Contains(normalized))
        {
            throw new InvalidOperationException($"Status must be one of: {string.Join(", ", AllowedVariantStatuses)}.");
        }

        return normalized;
    }

    private static string NormalizeExportFormat(string value)
    {
        var normalized = NormalizeRequiredToken(value, "Export format");
        if (!AllowedVariantExportFormats.Contains(normalized))
        {
            throw new InvalidOperationException($"Export format must be one of: {string.Join(", ", AllowedVariantExportFormats)}.");
        }

        return normalized;
    }

    private static string? NormalizeOptionalText(string? value)
    {
        var normalized = value?.Trim();
        return string.IsNullOrEmpty(normalized) ? null : normalized;
    }

    private static string SerializeLocalizedText(IDictionary<string, string> value)
    {
        var normalized = value
            .Where(item => !string.IsNullOrWhiteSpace(item.Value))
            .ToDictionary(
                item => item.Key.Trim().ToLowerInvariant(),
                item => item.Value.Trim());

        if (normalized.Count == 0)
        {
            throw new InvalidOperationException("At least one localized value is required.");
        }

        return JsonSerializer.Serialize(normalized);
    }

    private static IDictionary<string, string> DeserializeLocalizedText(string value)
    {
        if (string.IsNullOrWhiteSpace(value))
        {
            return new Dictionary<string, string>();
        }

        try
        {
            var parsed = JsonSerializer.Deserialize<Dictionary<string, string>>(value);
            if (parsed is not null && parsed.Count > 0)
            {
                return parsed;
            }
        }
        catch (JsonException)
        {
        }

        return new Dictionary<string, string>
        {
            ["en"] = value
        };
    }
}
