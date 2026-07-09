namespace Blog.Api.Entities;

public class ArticlePublicationVariant
{
    public Guid Id { get; set; }

    public Guid ArticleId { get; set; }

    public BlogArticle Article { get; set; } = null!;

    public string Platform { get; set; } = string.Empty;

    public string Locale { get; set; } = string.Empty;

    public string Title { get; set; } = string.Empty;

    public string Excerpt { get; set; } = string.Empty;

    public string ContentMarkdown { get; set; } = string.Empty;

    public string ExportFormat { get; set; } = "markdown";

    public string Status { get; set; } = "draft";

    public string? ExternalUrl { get; set; }

    public string? Notes { get; set; }

    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;

    public DateTime UpdatedAtUtc { get; set; } = DateTime.UtcNow;

    public DateTime? PublishedAtUtc { get; set; }
}
