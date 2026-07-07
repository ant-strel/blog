using System.ComponentModel.DataAnnotations;

namespace Blog.Api.Contracts.Admin;

public class CreateBlogArticleRequest
{
    [Required]
    public string Slug { get; set; } = string.Empty;

    [Required]
    public IDictionary<string, string> Title { get; set; } = new Dictionary<string, string>();

    [Required]
    public IDictionary<string, string> Excerpt { get; set; } = new Dictionary<string, string>();

    [Required]
    public IDictionary<string, string> Content { get; set; } = new Dictionary<string, string>();

    [Required]
    public string Author { get; set; } = string.Empty;

    public IList<string> Tags { get; set; } = [];
}
