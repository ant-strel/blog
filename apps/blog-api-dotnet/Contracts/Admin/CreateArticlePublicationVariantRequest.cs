using System.ComponentModel.DataAnnotations;

namespace Blog.Api.Contracts.Admin;

public class CreateArticlePublicationVariantRequest
{
    [Required]
    public string Platform { get; set; } = string.Empty;

    [Required]
    public string Locale { get; set; } = string.Empty;

    [Required]
    public string Title { get; set; } = string.Empty;

    public string Excerpt { get; set; } = string.Empty;

    [Required]
    public string ContentMarkdown { get; set; } = string.Empty;

    public string ExportFormat { get; set; } = "markdown";

    public string Status { get; set; } = "draft";

    public string? ExternalUrl { get; set; }

    public string? Notes { get; set; }
}
