using System.ComponentModel.DataAnnotations;

namespace AuthServer.Api.Contracts.Auth;

public class LoginRequest
{
    [Required]
    public string Login { get; set; } = string.Empty;

    [Required]
    public string Password { get; set; } = string.Empty;
}
