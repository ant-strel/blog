using Microsoft.AspNetCore.Identity;

namespace AuthServer.Api.Data.Entities;

public class ApplicationRole : IdentityRole<Guid>
{
    public string? Description { get; set; }
}
