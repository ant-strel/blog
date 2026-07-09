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
    Task<IList<ArticlePublicationVariantResponse>?> GetPublicationVariantsAsync(Guid articleId, CancellationToken cancellationToken);
    Task<ArticlePublicationVariantResponse?> GetPublicationVariantAsync(Guid articleId, Guid variantId, CancellationToken cancellationToken);
    Task<ArticlePublicationVariantResponse?> CreatePublicationVariantAsync(Guid articleId, CreateArticlePublicationVariantRequest request, CancellationToken cancellationToken);
    Task<ArticlePublicationVariantResponse?> UpdatePublicationVariantAsync(Guid articleId, Guid variantId, UpdateArticlePublicationVariantRequest request, CancellationToken cancellationToken);
    Task<bool?> DeletePublicationVariantAsync(Guid articleId, Guid variantId, CancellationToken cancellationToken);
}
