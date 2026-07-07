namespace Blog.Api.Services;

public interface IBlogSeeder
{
    Task SeedAsync(CancellationToken cancellationToken = default);
}
