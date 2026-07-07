namespace AuthServer.Api.Contracts.Auth;

public class TokenResponse
{
    public string AccessToken { get; set; } = string.Empty;

    public string RefreshToken { get; set; } = string.Empty;

    public DateTime AccessTokenExpiresAtUtc { get; set; }

    public DateTime RefreshTokenExpiresAtUtc { get; set; }
}
