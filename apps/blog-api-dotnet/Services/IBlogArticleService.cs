using Blog.Api.Contracts.Admin;
using Blog.Api.Contracts.Public;

namespace Blog.Api.Services;

public interface IBlogArticleService
{
    Task<PublicArticleListResponse> GetPublishedArticlesAsync(string? search, string? tag, CancellationToken cancellationToken);
    Task<PublicArticleResponse?> GetPublishedArticleBySlugAsync(string slug, CancellationToken cancellationToken);
    Task<IList<BlogArticleAdminResponse>> GetAdminArticlesAsync(string? status, CancellationToken cancellationToken);
    Task<BlogArticleAdminResponse?> GetAdminArticleByIdAsync(Guid id, CancellationToken cancellationToken);
    Task<BlogArticleAdminResponse> CreateAsync(CreateBlogArticleRequest request, CancellationToken cancellationToken);
    Task<BlogArticleAdminResponse?> UpdateAsync(Guid id, UpdateBlogArticleRequest request, CancellationToken cancellationToken);
    Task<ArticleStateChangeResponse?> PublishAsync(Guid id, CancellationToken cancellationToken);
    Task<ArticleStateChangeResponse?> ArchiveAsync(Guid id, CancellationToken cancellationToken);
    Task<bool> DeleteAsync(Guid id, CancellationToken cancellationToken);
}
