using System.ComponentModel.DataAnnotations;

namespace AuthServer.Api.Contracts.Auth;

public class RequestEmailConfirmationRequest
{
    [Required]
    public string Login { get; set; } = string.Empty;
}
