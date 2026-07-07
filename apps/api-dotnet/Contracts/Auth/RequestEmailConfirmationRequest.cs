using System.ComponentModel.DataAnnotations;

namespace AuthServer.Api.Contracts.Auth;

public class RequestEmailConfirmationRequest
{
    [Required]
    [EmailAddress]
    public string Email { get; set; } = string.Empty;
}
