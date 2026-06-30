using Blog.Api.Entities;
using Microsoft.EntityFrameworkCore;

namespace Blog.Api.Data;

public class BlogDbContext : DbContext
{
    public BlogDbContext(DbContextOptions<BlogDbContext> options) : base(options)
    {
    }

    public DbSet<BlogArticle> Articles => Set<BlogArticle>();
}
