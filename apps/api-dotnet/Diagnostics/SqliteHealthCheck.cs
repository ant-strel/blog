using AuthServer.Api.Data;
using Microsoft.Extensions.Diagnostics.HealthChecks;

namespace AuthServer.Api.Diagnostics;

public class SqliteHealthCheck : IHealthCheck
{
    private readonly AppDbContext _dbContext;

    public SqliteHealthCheck(AppDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<HealthCheckResult> CheckHealthAsync(
        HealthCheckContext context,
        CancellationToken cancellationToken = default)
    {
        await Task.Yield();
        var providerName = _dbContext.Database.ProviderName ?? "unknown";
        return HealthCheckResult.Healthy($"Database provider is {providerName}.");
    }
}
