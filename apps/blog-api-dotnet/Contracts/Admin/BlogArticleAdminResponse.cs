namespace Blog.Api.Contracts.Admin;

public class BlogArticleAdminResponse
{
    public Guid Id { get; set; }
    public string Slug { get; set; } = string.Empty;
    public IDictionary<string, string> Title { get; set; } = new Dictionary<string, string>();
    public IDictionary<string, string> Excerpt { get; set; } = new Dictionary<string, string>();
    public IDictionary<string, string> Content { get; set; } = new Dictionary<string, string>();
    public string Author { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public IList<string> Tags { get; set; } = [];
    public DateTime CreatedAtUtc { get; set; }
    public DateTime UpdatedAtUtc { get; set; }
    public DateTime? PublishedAtUtc { get; set; }
}
