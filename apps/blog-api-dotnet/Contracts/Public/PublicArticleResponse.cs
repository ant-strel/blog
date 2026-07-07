namespace Blog.Api.Contracts.Public;

public class PublicArticleResponse : PublicArticleSummaryResponse
{
    public IDictionary<string, string> Content { get; set; } = new Dictionary<string, string>();
}
