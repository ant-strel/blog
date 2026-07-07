using AuthServer.Api.Data;
using Microsoft.Extensions.Diagnostics.HealthChecks;

namespace AuthServer.Api.Diagnostics;

public class DatabaseHealthCheck : IHealthCheck
{
    private readonly AppDbContext _dbContext;

    public DatabaseHealthCheck(AppDbContext dbContext)
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
            return HealthCheckResult.Unhealthy("Database is unavailable.");
        }

        var providerName = _dbContext.Database.ProviderName ?? "unknown";
        return HealthCheckResult.Healthy($"Database provider is {providerName}.");
    }
}
