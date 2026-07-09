using Blog.Api.Contracts.Admin;

namespace Blog.Api.Services;

public interface IArticleMarkdownExportService
{
    Task<MarkdownExportResponse> ExportAllAsync(CancellationToken cancellationToken);
}
