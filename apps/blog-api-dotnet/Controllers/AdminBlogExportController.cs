using Blog.Api.Contracts.Admin;
using Blog.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Blog.Api.Controllers;

[ApiController]
[Route("api/admin/blog/export")]
[Authorize]
public class AdminBlogExportController : ControllerBase
{
    private readonly IArticleMarkdownExportService _exportService;

    public AdminBlogExportController(IArticleMarkdownExportService exportService)
    {
        _exportService = exportService;
    }

    [HttpPost("markdown")]
    [ProducesResponseType(typeof(MarkdownExportResponse), StatusCodes.Status200OK)]
    public async Task<IActionResult> ExportMarkdown(CancellationToken cancellationToken)
    {
        var result = await _exportService.ExportAllAsync(cancellationToken);
        return Ok(result);
    }
}
