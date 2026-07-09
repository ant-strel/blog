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

    [HttpGet("{id:guid}/variants")]
    [ProducesResponseType(typeof(IList<ArticlePublicationVariantResponse>), StatusCodes.Status200OK)]
    public async Task<IActionResult> ListVariants([FromRoute] Guid id, CancellationToken cancellationToken)
    {
        var variants = await _articleService.GetPublicationVariantsAsync(id, cancellationToken);
        return variants is null ? NotFound(new { message = "Article not found." }) : Ok(variants);
    }

    [HttpGet("{id:guid}/variants/{variantId:guid}")]
    [ProducesResponseType(typeof(ArticlePublicationVariantResponse), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetVariant(
        [FromRoute] Guid id,
        [FromRoute] Guid variantId,
        CancellationToken cancellationToken)
    {
        var variant = await _articleService.GetPublicationVariantAsync(id, variantId, cancellationToken);
        return variant is null ? NotFound(new { message = "Publication variant not found." }) : Ok(variant);
    }

    [HttpPost("{id:guid}/variants")]
    [ProducesResponseType(typeof(ArticlePublicationVariantResponse), StatusCodes.Status201Created)]
    public async Task<IActionResult> CreateVariant(
        [FromRoute] Guid id,
        CreateArticlePublicationVariantRequest request,
        CancellationToken cancellationToken)
    {
        try
        {
            var variant = await _articleService.CreatePublicationVariantAsync(id, request, cancellationToken);
            return variant is null
                ? NotFound(new { message = "Article not found." })
                : CreatedAtAction(nameof(GetVariant), new { id, variantId = variant.Id }, variant);
        }
        catch (InvalidOperationException exception)
        {
            return BadRequest(new { message = exception.Message });
        }
    }

    [HttpPut("{id:guid}/variants/{variantId:guid}")]
    [ProducesResponseType(typeof(ArticlePublicationVariantResponse), StatusCodes.Status200OK)]
    public async Task<IActionResult> UpdateVariant(
        [FromRoute] Guid id,
        [FromRoute] Guid variantId,
        UpdateArticlePublicationVariantRequest request,
        CancellationToken cancellationToken)
    {
        try
        {
            var variant = await _articleService.UpdatePublicationVariantAsync(id, variantId, request, cancellationToken);
            return variant is null ? NotFound(new { message = "Publication variant not found." }) : Ok(variant);
        }
        catch (InvalidOperationException exception)
        {
            return BadRequest(new { message = exception.Message });
        }
    }

    [HttpDelete("{id:guid}/variants/{variantId:guid}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    public async Task<IActionResult> DeleteVariant(
        [FromRoute] Guid id,
        [FromRoute] Guid variantId,
        CancellationToken cancellationToken)
    {
        var deleted = await _articleService.DeletePublicationVariantAsync(id, variantId, cancellationToken);
        if (deleted is null)
        {
            return NotFound(new { message = "Article not found." });
        }

        return deleted.Value ? NoContent() : NotFound(new { message = "Publication variant not found." });
    }
}
