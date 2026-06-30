using Blog.Api.Data;
using Microsoft.Extensions.Diagnostics.HealthChecks;

namespace Blog.Api.Services;

public class BlogHealthCheck : IHealthCheck
{
    private readonly BlogDbContext _dbContext;

    public BlogHealthCheck(BlogDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public Task<HealthCheckResult> CheckHealthAsync(
        HealthCheckContext context,
        CancellationToken cancellationToken = default)
    {
        var count = _dbContext.Articles.Count();
        return Task.FromResult(HealthCheckResult.Healthy($"Blog store ready. Seeded articles: {count}."));
    }
}
