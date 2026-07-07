namespace Blog.Api.Contracts.Public;

public class PublicArticleSummaryResponse
{
    public Guid Id { get; set; }
    public string Slug { get; set; } = string.Empty;
    public IDictionary<string, string> Title { get; set; } = new Dictionary<string, string>();
    public IDictionary<string, string> Excerpt { get; set; } = new Dictionary<string, string>();
    public string Author { get; set; } = string.Empty;
    public IList<string> Tags { get; set; } = [];
    public DateTime PublishedAtUtc { get; set; }
}
