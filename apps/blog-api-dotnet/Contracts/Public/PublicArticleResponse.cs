namespace Blog.Api.Contracts.Public;

public class PublicArticleResponse : PublicArticleSummaryResponse
{
    public string Content { get; set; } = string.Empty;
}
