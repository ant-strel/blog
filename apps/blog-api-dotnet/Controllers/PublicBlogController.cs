using Blog.Api.Contracts.Public;
using Blog.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Blog.Api.Controllers;

[ApiController]
[Route("api/blog")]
[AllowAnonymous]
public class PublicBlogController : ControllerBase
{
    private readonly IBlogArticleService _articleService;

    public PublicBlogController(IBlogArticleService articleService)
    {
        _articleService = articleService;
    }

    [HttpGet]
    [ProducesResponseType(typeof(PublicArticleListResponse), StatusCodes.Status200OK)]
    public async Task<IActionResult> List(
        [FromQuery] string? search = null,
        [FromQuery] string? tag = null,
        CancellationToken cancellationToken = default)
    {
        var response = await _articleService.GetPublishedArticlesAsync(search, tag, cancellationToken);
        return Ok(response);
    }

    [HttpGet("{slug}")]
    [ProducesResponseType(typeof(PublicArticleResponse), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetBySlug([FromRoute] string slug, CancellationToken cancellationToken = default)
    {
        var article = await _articleService.GetPublishedArticleBySlugAsync(slug, cancellationToken);
        return article is null ? NotFound(new { message = "Article not found." }) : Ok(article);
    }
}
