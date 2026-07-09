using Blog.Api.Contracts.Admin;
using Blog.Api.Data;
using Blog.Api.Entities;
using Blog.Api.Options;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace Blog.Api.Services;

public class ArticleMarkdownImportService : IArticleMarkdownImportService
{
    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNameCaseInsensitive = true,
        DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull
    };

    private readonly BlogDbContext _dbContext;
    private readonly BlogExportOptions _options;
    private readonly IWebHostEnvironment _environment;

    public ArticleMarkdownImportService(
        BlogDbContext dbContext,
        IOptions<BlogExportOptions> options,
        IWebHostEnvironment environment)
    {
        _dbContext = dbContext;
        _options = options.Value;
        _environment = environment;
    }

    public async Task<MarkdownImportResponse> ImportAllAsync(
        MarkdownImportRequest request,
        CancellationToken cancellationToken)
    {
        var rootPath = ResolveRootPath();
        if (!Directory.Exists(rootPath))
        {
            throw new InvalidOperationException($"Markdown import root '{rootPath}' does not exist.");
        }

        var importedAtUtc = DateTime.UtcNow;
        var backups = LoadArticleBackups(rootPath);
        var backupIds = backups.Select(backup => backup.Metadata.Id).ToHashSet();
        var existingArticles = await _dbContext.Articles
            .Include(article => article.PublicationVariants)
            .ToListAsync(cancellationToken);

        var upsertedArticles = 0;
        var upsertedVariants = 0;
        foreach (var backup in backups)
        {
            cancellationToken.ThrowIfCancellationRequested();

            var article = existingArticles.SingleOrDefault(item => item.Id == backup.Metadata.Id)
                ?? existingArticles.SingleOrDefault(item => item.Slug == backup.Metadata.Slug);
            if (article is null)
            {
                article = new BlogArticle
                {
                    Id = backup.Metadata.Id
                };
                _dbContext.Articles.Add(article);
                existingArticles.Add(article);
            }
            else if (article.Id != backup.Metadata.Id)
            {
                backupIds.Remove(backup.Metadata.Id);
                backupIds.Add(article.Id);
            }

            var slugOwner = existingArticles.SingleOrDefault(item => item.Slug == backup.Metadata.Slug);
            if (slugOwner is not null && slugOwner.Id != article.Id)
            {
                throw new InvalidOperationException(
                    $"Cannot import article '{backup.Metadata.Slug}' because the slug belongs to another article.");
            }

            article.Slug = backup.Metadata.Slug;
            article.Title = JsonSerializer.Serialize(backup.BlogTitle, JsonOptions);
            article.Excerpt = JsonSerializer.Serialize(backup.BlogExcerpt, JsonOptions);
            article.Content = JsonSerializer.Serialize(backup.BlogContent, JsonOptions);
            article.Author = backup.Metadata.Author;
            article.Status = backup.Metadata.Status;
            article.Tags = backup.Metadata.Tags;
            article.CreatedAtUtc = backup.Metadata.CreatedAtUtc;
            article.UpdatedAtUtc = backup.Metadata.UpdatedAtUtc;
            article.PublishedAtUtc = backup.Metadata.PublishedAtUtc;
            upsertedArticles++;

            upsertedVariants += UpsertVariants(article, backup);
        }

        var deletedArticles = 0;
        if (request.PruneMissing)
        {
            var staleArticles = existingArticles
                .Where(article => !backupIds.Contains(article.Id))
                .ToList();
            foreach (var staleArticle in staleArticles)
            {
                _dbContext.Articles.Remove(staleArticle);
                deletedArticles++;
            }
        }

        await _dbContext.SaveChangesAsync(cancellationToken);

        return new MarkdownImportResponse
        {
            RootPath = rootPath,
            ArticleCount = backups.Count,
            VariantCount = backups.Sum(backup => backup.Variants.Count),
            UpsertedArticles = upsertedArticles,
            UpsertedVariants = upsertedVariants,
            DeletedArticles = deletedArticles,
            PruneMissing = request.PruneMissing,
            ImportedAtUtc = importedAtUtc
        };
    }

    private int UpsertVariants(BlogArticle article, ArticleBackup backup)
    {
        var expectedVariantKeys = backup.Variants
            .Select(variant => $"{variant.Platform}\u001f{variant.Locale}")
            .ToHashSet(StringComparer.Ordinal);

        var count = 0;
        foreach (var backupVariant in backup.Variants)
        {
            var variant = article.PublicationVariants.SingleOrDefault(item => item.Id == backupVariant.Id)
                ?? article.PublicationVariants.SingleOrDefault(item =>
                    item.Platform == backupVariant.Platform && item.Locale == backupVariant.Locale);
            if (variant is null)
            {
                variant = new ArticlePublicationVariant
                {
                    Id = backupVariant.Id,
                    ArticleId = article.Id
                };
                article.PublicationVariants.Add(variant);
            }

            variant.Platform = backupVariant.Platform;
            variant.Locale = backupVariant.Locale;
            variant.Title = backupVariant.Title;
            variant.Excerpt = backupVariant.Excerpt;
            variant.ContentMarkdown = backupVariant.ContentMarkdown;
            variant.ExportFormat = backupVariant.ExportFormat;
            variant.Status = backupVariant.Status;
            variant.ExternalUrl = backupVariant.ExternalUrl;
            variant.CreatedAtUtc = backupVariant.CreatedAtUtc;
            variant.UpdatedAtUtc = backupVariant.UpdatedAtUtc;
            variant.PublishedAtUtc = backupVariant.PublishedAtUtc;
            count++;
        }

        var staleVariants = article.PublicationVariants
            .Where(variant => !expectedVariantKeys.Contains($"{variant.Platform}\u001f{variant.Locale}"))
            .ToList();
        foreach (var staleVariant in staleVariants)
        {
            _dbContext.PublicationVariants.Remove(staleVariant);
        }

        return count;
    }

    private string ResolveRootPath()
    {
        if (string.IsNullOrWhiteSpace(_options.RootPath))
        {
            throw new InvalidOperationException("BlogExport:RootPath is not configured.");
        }

        return Path.GetFullPath(_options.RootPath, _environment.ContentRootPath);
    }

    private static List<ArticleBackup> LoadArticleBackups(string rootPath)
    {
        var backups = new List<ArticleBackup>();
        foreach (var directoryPath in Directory.EnumerateDirectories(rootPath).OrderBy(path => path, StringComparer.Ordinal))
        {
            var metadataPath = Path.Combine(directoryPath, "article.json");
            if (!File.Exists(metadataPath))
            {
                continue;
            }

            var metadata = JsonSerializer.Deserialize<ArticleBackupMetadata>(
                File.ReadAllText(metadataPath),
                JsonOptions) ?? throw new InvalidOperationException($"Invalid article metadata: {metadataPath}");
            if (metadata.Id == Guid.Empty || string.IsNullOrWhiteSpace(metadata.Slug))
            {
                throw new InvalidOperationException($"Article metadata is missing Id or Slug: {metadataPath}");
            }

            var backup = new ArticleBackup(metadata);
            foreach (var markdownPath in Directory.EnumerateFiles(directoryPath, "*.md").OrderBy(path => path, StringComparer.Ordinal))
            {
                var document = MarkdownDocument.Parse(markdownPath);
                var platform = document.Get("platform");
                if (string.Equals(platform, "blog", StringComparison.OrdinalIgnoreCase))
                {
                    var locale = document.Require("locale", markdownPath);
                    backup.BlogTitle[locale] = document.Require("title", markdownPath);
                    backup.BlogExcerpt[locale] = document.Get("excerpt") ?? string.Empty;
                    backup.BlogContent[locale] = document.Content;
                    continue;
                }

                var variantId = Guid.TryParse(document.Get("variantId"), out var parsedVariantId)
                    ? parsedVariantId
                    : Guid.Empty;
                var variantMetadata = metadata.Variants.SingleOrDefault(variant => variant.Id == variantId)
                    ?? metadata.Variants.SingleOrDefault(variant =>
                        variant.Platform == document.Get("platform") && variant.Locale == document.Get("locale"));

                backup.Variants.Add(ArticleVariantBackup.FromMarkdown(document, variantMetadata, markdownPath));
            }

            if (backup.BlogContent.Count == 0)
            {
                throw new InvalidOperationException($"Article backup has no blog markdown files: {directoryPath}");
            }

            backups.Add(backup);
        }

        return backups;
    }

    private sealed class ArticleBackup(ArticleBackupMetadata metadata)
    {
        public ArticleBackupMetadata Metadata { get; } = metadata;

        public Dictionary<string, string> BlogTitle { get; } = new(StringComparer.Ordinal);

        public Dictionary<string, string> BlogExcerpt { get; } = new(StringComparer.Ordinal);

        public Dictionary<string, string> BlogContent { get; } = new(StringComparer.Ordinal);

        public List<ArticleVariantBackup> Variants { get; } = [];
    }

    private sealed class ArticleBackupMetadata
    {
        public Guid Id { get; set; }

        public string Slug { get; set; } = string.Empty;

        public string Author { get; set; } = string.Empty;

        public string Status { get; set; } = "draft";

        public string[] Tags { get; set; } = [];

        public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;

        public DateTime UpdatedAtUtc { get; set; } = DateTime.UtcNow;

        public DateTime? PublishedAtUtc { get; set; }

        public ArticleVariantMetadata[] Variants { get; set; } = [];
    }

    private sealed class ArticleVariantMetadata
    {
        public Guid Id { get; set; }

        public string Platform { get; set; } = string.Empty;

        public string Locale { get; set; } = string.Empty;

        public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;

        public DateTime UpdatedAtUtc { get; set; } = DateTime.UtcNow;

        public DateTime? PublishedAtUtc { get; set; }
    }

    private sealed class ArticleVariantBackup
    {
        public Guid Id { get; init; }

        public string Platform { get; init; } = string.Empty;

        public string Locale { get; init; } = string.Empty;

        public string Title { get; init; } = string.Empty;

        public string Excerpt { get; init; } = string.Empty;

        public string ContentMarkdown { get; init; } = string.Empty;

        public string ExportFormat { get; init; } = "markdown";

        public string Status { get; init; } = "draft";

        public string? ExternalUrl { get; init; }

        public DateTime CreatedAtUtc { get; init; } = DateTime.UtcNow;

        public DateTime UpdatedAtUtc { get; init; } = DateTime.UtcNow;

        public DateTime? PublishedAtUtc { get; init; }

        public static ArticleVariantBackup FromMarkdown(
            MarkdownDocument document,
            ArticleVariantMetadata? metadata,
            string path)
        {
            return new ArticleVariantBackup
            {
                Id = metadata?.Id ?? (Guid.TryParse(document.Get("variantId"), out var id) ? id : Guid.NewGuid()),
                Platform = document.Require("platform", path),
                Locale = document.Require("locale", path),
                Title = document.Require("title", path),
                Excerpt = document.Get("excerpt") ?? string.Empty,
                ContentMarkdown = document.Content,
                ExportFormat = document.Get("exportFormat") ?? "markdown",
                Status = document.Get("status") ?? "draft",
                ExternalUrl = document.Get("externalUrl"),
                CreatedAtUtc = metadata?.CreatedAtUtc ?? DateTime.UtcNow,
                UpdatedAtUtc = metadata?.UpdatedAtUtc ?? ParseDateTime(document.Get("updatedAtUtc")) ?? DateTime.UtcNow,
                PublishedAtUtc = metadata?.PublishedAtUtc ?? ParseDateTime(document.Get("publishedAtUtc"))
            };
        }
    }

    private sealed class MarkdownDocument
    {
        private MarkdownDocument(Dictionary<string, string> frontMatter, string content)
        {
            FrontMatter = frontMatter;
            Content = content.Trim();
        }

        public Dictionary<string, string> FrontMatter { get; }

        public string Content { get; }

        public string? Get(string key) => FrontMatter.GetValueOrDefault(key);

        public string Require(string key, string path)
        {
            var value = Get(key);
            if (string.IsNullOrWhiteSpace(value))
            {
                throw new InvalidOperationException($"Markdown file '{path}' is missing '{key}' front matter.");
            }

            return value;
        }

        public static MarkdownDocument Parse(string path)
        {
            var text = File.ReadAllText(path).Replace("\r\n", "\n", StringComparison.Ordinal);
            if (!text.StartsWith("---\n", StringComparison.Ordinal))
            {
                throw new InvalidOperationException($"Markdown file '{path}' is missing front matter.");
            }

            var endIndex = text.IndexOf("\n---\n", 4, StringComparison.Ordinal);
            if (endIndex < 0)
            {
                throw new InvalidOperationException($"Markdown file '{path}' has invalid front matter.");
            }

            var frontMatter = ParseFrontMatter(text[4..endIndex]);
            var content = text[(endIndex + "\n---\n".Length)..];
            return new MarkdownDocument(frontMatter, content);
        }

        private static Dictionary<string, string> ParseFrontMatter(string value)
        {
            var result = new Dictionary<string, string>(StringComparer.Ordinal);
            var lines = value.Split('\n');
            for (var index = 0; index < lines.Length; index++)
            {
                var line = lines[index];
                if (string.IsNullOrWhiteSpace(line))
                {
                    continue;
                }

                if (string.Equals(line, "tags:", StringComparison.Ordinal))
                {
                    while (index + 1 < lines.Length && lines[index + 1].StartsWith("  - ", StringComparison.Ordinal))
                    {
                        index++;
                    }

                    continue;
                }

                var separatorIndex = line.IndexOf(':', StringComparison.Ordinal);
                if (separatorIndex <= 0)
                {
                    continue;
                }

                var key = line[..separatorIndex].Trim();
                var rawValue = line[(separatorIndex + 1)..].Trim();
                result[key] = ParseScalar(rawValue);
            }

            return result;
        }

        private static string ParseScalar(string rawValue)
        {
            if (rawValue.Length == 0)
            {
                return string.Empty;
            }

            try
            {
                return JsonSerializer.Deserialize<string>(rawValue) ?? string.Empty;
            }
            catch (JsonException)
            {
                return rawValue;
            }
        }
    }

    private static DateTime? ParseDateTime(string? value)
    {
        return DateTime.TryParse(value, out var parsed) ? parsed.ToUniversalTime() : null;
    }
}
