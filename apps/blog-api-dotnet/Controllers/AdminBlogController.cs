using Blog.Api.Contracts.Admin;
using Blog.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Blog.Api.Controllers;

[ApiController]
[Route("api/admin/blog/articles")]
[Authorize]
public class AdminBlogController : ControllerBase
{
    private readonly IBlogArticleService _articleService;

    public AdminBlogController(IBlogArticleService articleService)
    {
        _articleService = articleService;
    }

    [HttpGet]
    [ProducesResponseType(typeof(IList<BlogArticleAdminResponse>), StatusCodes.Status200OK)]
    public async Task<IActionResult> List([FromQuery] string? status = null, CancellationToken cancellationToken = default)
    {
        var items = await _articleService.GetAdminArticlesAsync(status, cancellationToken);
        return Ok(items);
    }

    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(BlogArticleAdminResponse), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetById([FromRoute] Guid id, CancellationToken cancellationToken = default)
    {
        var article = await _articleService.GetAdminArticleByIdAsync(id, cancellationToken);
        return article is null ? NotFound(new { message = "Article not found." }) : Ok(article);
    }

    [HttpPost]
    [ProducesResponseType(typeof(BlogArticleAdminResponse), StatusCodes.Status201Created)]
    public async Task<IActionResult> Create(CreateBlogArticleRequest request, CancellationToken cancellationToken)
    {
        try
        {
            var article = await _articleService.CreateAsync(request, cancellationToken);
            return CreatedAtAction(nameof(GetById), new { id = article.Id }, article);
        }
        catch (InvalidOperationException exception)
        {
            return BadRequest(new { message = exception.Message });
        }
    }

    [HttpPut("{id:guid}")]
    [ProducesResponseType(typeof(BlogArticleAdminResponse), StatusCodes.Status200OK)]
    public async Task<IActionResult> Update(
        [FromRoute] Guid id,
        UpdateBlogArticleRequest request,
        CancellationToken cancellationToken)
    {
        try
        {
            var article = await _articleService.UpdateAsync(id, request, cancellationToken);
            return article is null ? NotFound(new { message = "Article not found." }) : Ok(article);
        }
        catch (InvalidOperationException exception)
        {
            return BadRequest(new { message = exception.Message });
        }
    }

    [HttpPost("{id:guid}/publish")]
    [ProducesResponseType(typeof(ArticleStateChangeResponse), StatusCodes.Status200OK)]
    public async Task<IActionResult> Publish([FromRoute] Guid id, CancellationToken cancellationToken)
    {
        var article = await _articleService.PublishAsync(id, cancellationToken);
        return article is null ? NotFound(new { message = "Article not found." }) : Ok(article);
    }

    [HttpPost("{id:guid}/archive")]
    [ProducesResponseType(typeof(ArticleStateChangeResponse), StatusCodes.Status200OK)]
    public async Task<IActionResult> Archive([FromRoute] Guid id, CancellationToken cancellationToken)
    {
        var article = await _articleService.ArchiveAsync(id, cancellationToken);
        return article is null ? NotFound(new { message = "Article not found." }) : Ok(article);
    }

    [HttpDelete("{id:guid}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    public async Task<IActionResult> Delete([FromRoute] Guid id, CancellationToken cancellationToken)
    {
        var deleted = await _articleService.DeleteAsync(id, cancellationToken);
        return deleted ? NoContent() : NotFound(new { message = "Article not found." });
    }
}
