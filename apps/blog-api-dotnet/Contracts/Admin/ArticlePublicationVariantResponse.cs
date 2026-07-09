namespace Blog.Api.Contracts.Admin;

public class ArticlePublicationVariantResponse
{
    public Guid Id { get; set; }

    public Guid ArticleId { get; set; }

    public string Platform { get; set; } = string.Empty;

    public string Locale { get; set; } = string.Empty;

    public string Title { get; set; } = string.Empty;

    public string Excerpt { get; set; } = string.Empty;

    public string ContentMarkdown { get; set; } = string.Empty;

    public string ExportFormat { get; set; } = string.Empty;

    public string Status { get; set; } = string.Empty;

    public string? ExternalUrl { get; set; }

    public string? Notes { get; set; }

    public DateTime CreatedAtUtc { get; set; }

    public DateTime UpdatedAtUtc { get; set; }

    public DateTime? PublishedAtUtc { get; set; }
}
