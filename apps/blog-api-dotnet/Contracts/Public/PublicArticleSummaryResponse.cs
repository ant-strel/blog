namespace Blog.Api.Contracts.Public;

public class PublicArticleSummaryResponse
{
    public Guid Id { get; set; }
    public string Slug { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string Excerpt { get; set; } = string.Empty;
    public string Author { get; set; } = string.Empty;
    public IList<string> Tags { get; set; } = [];
    public DateTime PublishedAtUtc { get; set; }
}
