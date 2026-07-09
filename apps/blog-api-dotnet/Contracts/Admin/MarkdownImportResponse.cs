namespace Blog.Api.Contracts.Admin;

public class MarkdownImportResponse
{
    public string RootPath { get; set; } = string.Empty;

    public int ArticleCount { get; set; }

    public int VariantCount { get; set; }

    public int UpsertedArticles { get; set; }

    public int UpsertedVariants { get; set; }

    public int DeletedArticles { get; set; }

    public bool PruneMissing { get; set; }

    public DateTime ImportedAtUtc { get; set; }
}
