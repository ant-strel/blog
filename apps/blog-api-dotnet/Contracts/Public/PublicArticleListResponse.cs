namespace Blog.Api.Contracts.Public;

public class PublicArticleListResponse
{
    public IList<PublicArticleSummaryResponse> Items { get; set; } = [];
    public int Total { get; set; }
}
