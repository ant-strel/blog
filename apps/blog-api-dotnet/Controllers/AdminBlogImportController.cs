using Blog.Api.Contracts.Admin;
using Blog.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Blog.Api.Controllers;

[ApiController]
[Route("api/admin/blog/import")]
[Authorize]
public class AdminBlogImportController : ControllerBase
{
    private readonly IArticleMarkdownImportService _importService;

    public AdminBlogImportController(IArticleMarkdownImportService importService)
    {
        _importService = importService;
    }

    [HttpPost("markdown")]
    [ProducesResponseType(typeof(MarkdownImportResponse), StatusCodes.Status200OK)]
    public async Task<IActionResult> ImportMarkdown(
        MarkdownImportRequest request,
        CancellationToken cancellationToken)
    {
        try
        {
            var result = await _importService.ImportAllAsync(request, cancellationToken);
            return Ok(result);
        }
        catch (InvalidOperationException exception)
        {
            return BadRequest(new { message = exception.Message });
        }
    }
}
