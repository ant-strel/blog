using Blog.Api.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.ChangeTracking;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;
using System.Text.Json;

namespace Blog.Api.Data;

public class BlogDbContext : DbContext
{
    public BlogDbContext(DbContextOptions<BlogDbContext> options) : base(options)
    {
    }

    public DbSet<BlogArticle> Articles => Set<BlogArticle>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        var tagsConverter = new ValueConverter<string[], string>(
            tags => JsonSerializer.Serialize(tags, (JsonSerializerOptions?)null),
            value => JsonSerializer.Deserialize<string[]>(value, (JsonSerializerOptions?)null) ?? Array.Empty<string>());
        var tagsComparer = new ValueComparer<string[]>(
            (left, right) => left!.SequenceEqual(right!),
            tags => tags.Aggregate(0, (hash, value) => HashCode.Combine(hash, value.GetHashCode(StringComparison.Ordinal))),
            tags => tags.ToArray());

        modelBuilder.Entity<BlogArticle>(entity =>
        {
            entity.HasKey(article => article.Id);
            entity.HasIndex(article => article.Slug).IsUnique();
            entity.Property(article => article.Slug).HasMaxLength(160).IsRequired();
            entity.Property(article => article.Title).HasMaxLength(256).IsRequired();
            entity.Property(article => article.Excerpt).HasMaxLength(1024).IsRequired();
            entity.Property(article => article.Content).IsRequired();
            entity.Property(article => article.Author).HasMaxLength(128).IsRequired();
            entity.Property(article => article.Status).HasMaxLength(32).IsRequired();
            entity.Property(article => article.Tags)
                .HasConversion(tagsConverter)
                .Metadata.SetValueComparer(tagsComparer);
        });
    }
}
