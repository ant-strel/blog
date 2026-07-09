using System.ComponentModel.DataAnnotations;

namespace AuthServer.Api.Contracts.Auth;

public class ForgotPasswordRequest
{
    [Required]
    public string Login { get; set; } = string.Empty;
}
