namespace AuthServer.Api.Services;

public interface IAuthSeeder
{
    Task SeedAsync(CancellationToken cancellationToken = default);
}
