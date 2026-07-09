using System.ComponentModel.DataAnnotations;

namespace AuthServer.Api.Contracts.Auth;

public class ResetPasswordRequest
{
    [Required]
    public string Login { get; set; } = string.Empty;

    [Required]
    public string Token { get; set; } = string.Empty;

    [Required]
    [MinLength(8)]
    public string NewPassword { get; set; } = string.Empty;
}
