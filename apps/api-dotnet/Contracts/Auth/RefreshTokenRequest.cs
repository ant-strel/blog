using System.ComponentModel.DataAnnotations;

namespace AuthServer.Api.Contracts.Auth;

public class RefreshTokenRequest
{
    [Required]
    public string RefreshToken { get; set; } = string.Empty;
}
