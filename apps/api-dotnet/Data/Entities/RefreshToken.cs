namespace AuthServer.Api.Data.Entities;

public class RefreshToken
{
    public Guid Id { get; set; }

    public string TokenHash { get; set; } = string.Empty;

    public Guid UserId { get; set; }

    public ApplicationUser User { get; set; } = null!;

    public DateTime ExpiresAtUtc { get; set; }

    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;

    public DateTime? RevokedAtUtc { get; set; }

    public string? ReplacedByTokenHash { get; set; }

    public string? CreatedByIp { get; set; }

    public string? RevokedByIp { get; set; }

    public bool IsExpired => DateTime.UtcNow >= ExpiresAtUtc;

    public bool IsRevoked => RevokedAtUtc.HasValue;

    public bool IsActive => !IsExpired && !IsRevoked;
}
