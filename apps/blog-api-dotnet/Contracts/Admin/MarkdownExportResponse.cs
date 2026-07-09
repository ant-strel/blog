namespace Blog.Api.Contracts.Admin;

public class MarkdownExportResponse
{
    public string RootPath { get; set; } = string.Empty;

    public int ArticleCount { get; set; }

    public int FileCount { get; set; }

    public DateTime ExportedAtUtc { get; set; }
}
