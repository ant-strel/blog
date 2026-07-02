using Blog.Api.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Diagnostics.HealthChecks;

namespace Blog.Api.Services;

public class BlogHealthCheck : IHealthCheck
{
    private readonly BlogDbContext _dbContext;

    public BlogHealthCheck(BlogDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<HealthCheckResult> CheckHealthAsync(
        HealthCheckContext context,
        CancellationToken cancellationToken = default)
    {
        var canConnect = await _dbContext.Database.CanConnectAsync(cancellationToken);
        if (!canConnect)
        {
            return HealthCheckResult.Unhealthy("Blog database is unavailable.");
        }

        var count = await _dbContext.Articles.CountAsync(cancellationToken);
        return HealthCheckResult.Healthy($"Blog store ready. Seeded articles: {count}.");
    }
}
