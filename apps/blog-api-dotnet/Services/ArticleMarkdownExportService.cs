using Blog.Api.Contracts.Admin;
using Blog.Api.Data;
using Blog.Api.Entities;
using Blog.Api.Options;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace Blog.Api.Services;

public class ArticleMarkdownExportService : IArticleMarkdownExportService
{
    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        WriteIndented = true,
        DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull
    };

    private readonly BlogDbContext _dbContext;
    private readonly BlogExportOptions _options;
    private readonly IWebHostEnvironment _environment;

    public ArticleMarkdownExportService(
        BlogDbContext dbContext,
        IOptions<BlogExportOptions> options,
        IWebHostEnvironment environment)
    {
        _dbContext = dbContext;
        _options = options.Value;
        _environment = environment;
    }

    public async Task<MarkdownExportResponse> ExportAllAsync(CancellationToken cancellationToken)
    {
        var rootPath = ResolveRootPath();
        Directory.CreateDirectory(rootPath);

        var exportedAtUtc = DateTime.UtcNow;
        var articles = await _dbContext.Articles
            .Include(article => article.PublicationVariants)
            .OrderBy(article => article.Slug)
            .ToListAsync(cancellationToken);

        var fileCount = 0;
        foreach (var article in articles)
        {
            cancellationToken.ThrowIfCancellationRequested();
            fileCount += await ExportArticleAsync(rootPath, article, exportedAtUtc, cancellationToken);
        }

        return new MarkdownExportResponse
        {
            RootPath = rootPath,
            ArticleCount = articles.Count,
            FileCount = fileCount,
            ExportedAtUtc = exportedAtUtc
        };
    }

    private async Task<int> ExportArticleAsync(
        string rootPath,
        BlogArticle article,
        DateTime exportedAtUtc,
        CancellationToken cancellationToken)
    {
        var articleDirectory = Path.Combine(rootPath, ToSafePathSegment(article.Slug));
        Directory.CreateDirectory(articleDirectory);
        DeleteManagedFiles(articleDirectory);

        var fileCount = 0;
        var title = DeserializeLocalizedText(article.Title);
        var excerpt = DeserializeLocalizedText(article.Excerpt);
        var content = DeserializeLocalizedText(article.Content);

        foreach (var localeContent in content.OrderBy(item => item.Key, StringComparer.Ordinal))
        {
            var locale = ToSafePathSegment(localeContent.Key);
            var fileName = $"blog.{locale}.md";
            var markdown = BuildMarkdownDocument(
                TryGetLocalizedValue(title, localeContent.Key) ?? article.Slug,
                TryGetLocalizedValue(excerpt, localeContent.Key) ?? string.Empty,
                localeContent.Value,
                new Dictionary<string, string?>
                {
                    ["articleId"] = article.Id.ToString(),
                    ["slug"] = article.Slug,
                    ["platform"] = "blog",
                    ["locale"] = localeContent.Key,
                    ["status"] = article.Status,
                    ["author"] = article.Author,
                    ["publishedAtUtc"] = article.PublishedAtUtc?.ToString("O"),
                    ["updatedAtUtc"] = article.UpdatedAtUtc.ToString("O")
                },
                article.Tags);

            await WriteTextIfChangedAsync(Path.Combine(articleDirectory, fileName), markdown, cancellationToken);
            fileCount++;
        }

        var variants = article.PublicationVariants
            .OrderBy(variant => variant.Platform, StringComparer.Ordinal)
            .ThenBy(variant => variant.Locale, StringComparer.Ordinal)
            .ToList();

        foreach (var variant in variants)
        {
            var fileName = $"{ToSafePathSegment(variant.Platform)}.{ToSafePathSegment(variant.Locale)}.md";
            var markdown = BuildMarkdownDocument(
                variant.Title,
                variant.Excerpt,
                variant.ContentMarkdown,
                new Dictionary<string, string?>
                {
                    ["articleId"] = article.Id.ToString(),
                    ["variantId"] = variant.Id.ToString(),
                    ["slug"] = article.Slug,
                    ["platform"] = variant.Platform,
                    ["locale"] = variant.Locale,
                    ["status"] = variant.Status,
                    ["exportFormat"] = variant.ExportFormat,
                    ["externalUrl"] = variant.ExternalUrl,
                    ["publishedAtUtc"] = variant.PublishedAtUtc?.ToString("O"),
                    ["updatedAtUtc"] = variant.UpdatedAtUtc.ToString("O")
                },
                article.Tags);

            await WriteTextIfChangedAsync(Path.Combine(articleDirectory, fileName), markdown, cancellationToken);
            fileCount++;
        }

        var metadata = new
        {
            article.Id,
            article.Slug,
            article.Author,
            article.Status,
            Tags = article.Tags.OrderBy(tag => tag, StringComparer.Ordinal).ToArray(),
            article.CreatedAtUtc,
            article.UpdatedAtUtc,
            article.PublishedAtUtc,
            ExportedAtUtc = exportedAtUtc,
            Locales = content.Keys.OrderBy(locale => locale, StringComparer.Ordinal).ToArray(),
            Variants = variants.Select(variant => new
            {
                variant.Id,
                variant.Platform,
                variant.Locale,
                variant.Status,
                variant.ExportFormat,
                variant.ExternalUrl,
                variant.CreatedAtUtc,
                variant.UpdatedAtUtc,
                variant.PublishedAtUtc
            }).ToArray()
        };

        await WriteTextIfChangedAsync(
            Path.Combine(articleDirectory, "article.json"),
            JsonSerializer.Serialize(metadata, JsonOptions) + Environment.NewLine,
            cancellationToken);
        fileCount++;

        return fileCount;
    }

    private string ResolveRootPath()
    {
        if (string.IsNullOrWhiteSpace(_options.RootPath))
        {
            throw new InvalidOperationException("BlogExport:RootPath is not configured.");
        }

        return Path.GetFullPath(_options.RootPath, _environment.ContentRootPath);
    }

    private static void DeleteManagedFiles(string articleDirectory)
    {
        foreach (var filePath in Directory.EnumerateFiles(articleDirectory, "*.md"))
        {
            File.Delete(filePath);
        }

        var metadataPath = Path.Combine(articleDirectory, "article.json");
        if (File.Exists(metadataPath))
        {
            File.Delete(metadataPath);
        }
    }

    private static string BuildMarkdownDocument(
        string title,
        string excerpt,
        string content,
        IDictionary<string, string?> frontMatter,
        IReadOnlyCollection<string> tags)
    {
        var builder = new StringBuilder();
        builder.AppendLine("---");
        builder.AppendLine($"title: {ToYamlString(title)}");
        if (!string.IsNullOrWhiteSpace(excerpt))
        {
            builder.AppendLine($"excerpt: {ToYamlString(excerpt)}");
        }

        foreach (var item in frontMatter.OrderBy(item => item.Key, StringComparer.Ordinal))
        {
            if (!string.IsNullOrWhiteSpace(item.Value))
            {
                builder.AppendLine($"{item.Key}: {ToYamlString(item.Value)}");
            }
        }

        builder.AppendLine("tags:");
        foreach (var tag in tags.OrderBy(tag => tag, StringComparer.Ordinal))
        {
            builder.AppendLine($"  - {ToYamlString(tag)}");
        }

        builder.AppendLine("---");
        builder.AppendLine();
        builder.AppendLine(content.Trim());
        builder.AppendLine();
        return builder.ToString();
    }

    private static string ToYamlString(string value)
    {
        return JsonSerializer.Serialize(value);
    }

    private static async Task WriteTextIfChangedAsync(string path, string content, CancellationToken cancellationToken)
    {
        if (File.Exists(path))
        {
            var current = await File.ReadAllTextAsync(path, cancellationToken);
            if (string.Equals(current, content, StringComparison.Ordinal))
            {
                return;
            }
        }

        await File.WriteAllTextAsync(path, content, Encoding.UTF8, cancellationToken);
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

    private static string? TryGetLocalizedValue(IDictionary<string, string> value, string locale)
    {
        return value.TryGetValue(locale, out var text) ? text : null;
    }

    private static string ToSafePathSegment(string value)
    {
        var normalized = value.Trim().ToLowerInvariant();
        var builder = new StringBuilder(normalized.Length);
        foreach (var character in normalized)
        {
            if (char.IsAsciiLetterOrDigit(character) || character == '-' || character == '_')
            {
                builder.Append(character);
            }
            else if (char.IsWhiteSpace(character) || character == '.' || character == '/')
            {
                builder.Append('-');
            }
        }

        return builder.Length == 0 ? "untitled" : builder.ToString();
    }
}
