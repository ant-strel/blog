using AuthServer.Api.Data.Entities;
using AuthServer.Api.Options;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Options;

namespace AuthServer.Api.Services;

public class AuthSeeder : IAuthSeeder
{
    private readonly RoleManager<ApplicationRole> _roleManager;
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly SeedOptions _seedOptions;

    public AuthSeeder(
        RoleManager<ApplicationRole> roleManager,
        UserManager<ApplicationUser> userManager,
        IOptions<SeedOptions> seedOptions)
    {
        _roleManager = roleManager;
        _userManager = userManager;
        _seedOptions = seedOptions.Value;
    }

    public async Task SeedAsync(CancellationToken cancellationToken = default)
    {
        ValidateSeedOptions();

        await EnsureRoleAsync("User");
        await EnsureRoleAsync("Editor");

        var user = await _userManager.FindByEmailAsync(_seedOptions.EditorEmail);
        if (user is null)
        {
            user = new ApplicationUser
            {
                Id = Guid.NewGuid(),
                UserName = _seedOptions.EditorEmail,
                Email = _seedOptions.EditorEmail,
                EmailConfirmed = true,
                FirstName = _seedOptions.EditorFirstName,
                LastName = _seedOptions.EditorLastName,
                IsActive = true,
                CreatedAtUtc = DateTime.UtcNow
            };

            var result = await _userManager.CreateAsync(user, _seedOptions.EditorPassword);
            if (!result.Succeeded)
            {
                throw new InvalidOperationException(
                    $"Failed to seed editor user: {string.Join("; ", result.Errors.Select(error => error.Description))}");
            }

            await _userManager.AddToRolesAsync(user, ["User", "Editor"]);
            return;
        }

        if (!user.EmailConfirmed)
        {
            user.EmailConfirmed = true;
            await _userManager.UpdateAsync(user);
        }

        await EnsureUserRoleAsync(user, "User");
        await EnsureUserRoleAsync(user, "Editor");
    }

    private async Task EnsureRoleAsync(string roleName)
    {
        if (!await _roleManager.RoleExistsAsync(roleName))
        {
            await _roleManager.CreateAsync(new ApplicationRole
            {
                Id = Guid.NewGuid(),
                Name = roleName,
                NormalizedName = roleName.ToUpperInvariant(),
                Description = $"Seeded {roleName} role."
            });
        }
    }

    private async Task EnsureUserRoleAsync(ApplicationUser user, string roleName)
    {
        if (!await _userManager.IsInRoleAsync(user, roleName))
        {
            await _userManager.AddToRoleAsync(user, roleName);
        }
    }

    private void ValidateSeedOptions()
    {
        if (string.IsNullOrWhiteSpace(_seedOptions.EditorEmail))
        {
            throw new InvalidOperationException("Seed:EditorEmail is not configured.");
        }

        if (string.IsNullOrWhiteSpace(_seedOptions.EditorPassword))
        {
            throw new InvalidOperationException("Seed:EditorPassword is not configured.");
        }
    }
}
