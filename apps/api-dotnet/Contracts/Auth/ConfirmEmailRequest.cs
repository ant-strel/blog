using System.ComponentModel.DataAnnotations;

namespace AuthServer.Api.Contracts.Auth;

public class ConfirmEmailRequest
{
    [Required]
    public string Login { get; set; } = string.Empty;

    [Required]
    public string Token { get; set; } = string.Empty;
}
