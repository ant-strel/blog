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

    public DbSet<ArticlePublicationVariant> PublicationVariants => Set<ArticlePublicationVariant>();

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

        modelBuilder.Entity<ArticlePublicationVariant>(entity =>
        {
            entity.HasKey(variant => variant.Id);
            entity.HasIndex(variant => new { variant.ArticleId, variant.Platform, variant.Locale }).IsUnique();
            entity.Property(variant => variant.Platform).HasMaxLength(32).IsRequired();
            entity.Property(variant => variant.Locale).HasMaxLength(16).IsRequired();
            entity.Property(variant => variant.Title).HasMaxLength(256).IsRequired();
            entity.Property(variant => variant.Excerpt).HasMaxLength(1024).IsRequired();
            entity.Property(variant => variant.ContentMarkdown).IsRequired();
            entity.Property(variant => variant.ExportFormat).HasMaxLength(32).IsRequired();
            entity.Property(variant => variant.Status).HasMaxLength(32).IsRequired();
            entity.Property(variant => variant.ExternalUrl).HasMaxLength(512);
            entity.Property(variant => variant.Notes).HasMaxLength(2048);
            entity.HasOne(variant => variant.Article)
                .WithMany(article => article.PublicationVariants)
                .HasForeignKey(variant => variant.ArticleId)
                .OnDelete(DeleteBehavior.Cascade);
        });
    }
}
