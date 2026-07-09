using Blog.Api.Contracts.Admin;

namespace Blog.Api.Services;

public interface IArticleMarkdownImportService
{
    Task<MarkdownImportResponse> ImportAllAsync(MarkdownImportRequest request, CancellationToken cancellationToken);
}
