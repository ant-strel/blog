using System.ComponentModel.DataAnnotations;

namespace Blog.Api.Contracts.Admin;

public class CreateBlogArticleRequest
{
    [Required]
    public string Slug { get; set; } = string.Empty;

    [Required]
    public string Title { get; set; } = string.Empty;

    [Required]
    public string Excerpt { get; set; } = string.Empty;

    [Required]
    public string Content { get; set; } = string.Empty;

    [Required]
    public string Author { get; set; } = string.Empty;

    public IList<string> Tags { get; set; } = [];
}
