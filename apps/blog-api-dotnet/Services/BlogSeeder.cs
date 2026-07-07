using Blog.Api.Data;
using Blog.Api.Entities;
using Microsoft.EntityFrameworkCore;

namespace Blog.Api.Services;

public class BlogSeeder : IBlogSeeder
{
    private readonly BlogDbContext _dbContext;

    public BlogSeeder(BlogDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task SeedAsync(CancellationToken cancellationToken = default)
    {
        if (await _dbContext.Articles.AnyAsync(cancellationToken))
        {
            return;
        }

        var now = DateTime.UtcNow;
        _dbContext.Articles.AddRange(
            new BlogArticle
            {
                Id = Guid.NewGuid(),
                Slug = "react-auth-perimeter",
                Title = "{\"en\":\"React auth perimeter for the first platform slice\",\"ru\":\"React auth perimeter for the first platform slice\",\"es\":\"Perimetro de autenticacion React para el primer corte de plataforma\"}",
                Excerpt = "{\"en\":\"How public, account and admin shells share one JWT session model.\",\"ru\":\"How public, account and admin shells share one JWT session model.\",\"es\":\"Como las superficies public, account y admin comparten una sesion JWT.\"}",
                Content = "{\"en\":\"The first slice keeps auth JWT-first, moves API calls behind typed clients, and aligns route guards across shells.\",\"ru\":\"The first slice keeps auth JWT-first, moves API calls behind typed clients, and aligns route guards across shells.\",\"es\":\"El primer corte mantiene JWT como base de autenticacion, mueve las llamadas API detras de clientes tipados y alinea las rutas protegidas.\"}",
                Author = "Anton Strelkov",
                Tags = ["react", "auth", "jwt"],
                Status = "published",
                CreatedAtUtc = now.AddDays(-10),
                UpdatedAtUtc = now.AddDays(-9),
                PublishedAtUtc = now.AddDays(-9)
            },
            new BlogArticle
            {
                Id = Guid.NewGuid(),
                Slug = "blog-boundary-editor-later",
                Title = "{\"en\":\"Blog first, editor later\",\"ru\":\"Blog first, editor later\",\"es\":\"Primero el blog, despues el editor\"}",
                Excerpt = "{\"en\":\"Public blog surfaces belong in the first slice. Rich authoring does not.\",\"ru\":\"Public blog surfaces belong in the first slice. Rich authoring does not.\",\"es\":\"La parte publica del blog entra primero; la autoria avanzada no.\"}",
                Content = "{\"en\":\"Landing pages remain config-driven while articles alone cross into editor-backed territory.\",\"ru\":\"Landing pages remain config-driven while articles alone cross into editor-backed territory.\",\"es\":\"Las paginas publicas quedan guiadas por configuracion y solo los articulos pasan al territorio del editor.\"}",
                Author = "Anton Strelkov",
                Tags = ["blog", "content", "architecture"],
                Status = "published",
                CreatedAtUtc = now.AddDays(-5),
                UpdatedAtUtc = now.AddDays(-4),
                PublishedAtUtc = now.AddDays(-4)
            },
            new BlogArticle
            {
                Id = Guid.NewGuid(),
                Slug = "draft-editor-entrypoint",
                Title = "{\"en\":\"Draft editor entrypoint\",\"ru\":\"Draft editor entrypoint\",\"es\":\"Entrada al editor de borradores\"}",
                Excerpt = "{\"en\":\"Protected drafts live behind auth and stay out of the public site by default.\",\"ru\":\"Protected drafts live behind auth and stay out of the public site by default.\",\"es\":\"Los borradores protegidos viven tras autenticacion y no aparecen publicamente por defecto.\"}",
                Content = "{\"en\":\"This draft exists only to validate the auth guard and content boundary.\",\"ru\":\"This draft exists only to validate the auth guard and content boundary.\",\"es\":\"Este borrador existe solo para validar la proteccion de rutas y el limite de contenido.\"}",
                Author = "Editorial Owner",
                Tags = ["drafts", "editor"],
                Status = "draft",
                CreatedAtUtc = now.AddDays(-1),
                UpdatedAtUtc = now
            });

        await _dbContext.SaveChangesAsync(cancellationToken);
    }
}
