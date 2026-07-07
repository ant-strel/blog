using AuthServer.Api.Contracts.Auth;
using AuthServer.Api.Data.Entities;

namespace AuthServer.Api.Services;

public interface ITokenService
{
    Task<TokenResponse> CreateTokenResponseAsync(
        ApplicationUser user,
        string? ipAddress,
        CancellationToken cancellationToken = default);

    string GenerateRefreshToken();

    string HashToken(string token);
}
