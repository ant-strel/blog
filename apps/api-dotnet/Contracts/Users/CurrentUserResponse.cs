namespace AuthServer.Api.Contracts.Users;

public class CurrentUserResponse
{
    public Guid Id { get; set; }

    public string Email { get; set; } = string.Empty;

    public string? FirstName { get; set; }

    public string? LastName { get; set; }

    public bool IsActive { get; set; }

    public IList<string> Roles { get; set; } = [];
}
