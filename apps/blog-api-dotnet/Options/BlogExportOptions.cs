namespace Blog.Api.Options;

public class BlogExportOptions
{
    public const string SectionName = "BlogExport";

    public string RootPath { get; set; } = "content/articles";
}
