using AuthServer.Api.Contracts.Auth;
using AuthServer.Api.Contracts.Users;
using AuthServer.Api.Data;
using AuthServer.Api.Data.Entities;
using AuthServer.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace AuthServer.Api.Controllers;

[ApiController]
[Route("api/auth")]
[EnableRateLimiting("AuthSensitive")]
public class AuthController : ControllerBase
{
    private const string RefreshTokenCookieName = "refresh_token";
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly SignInManager<ApplicationUser> _signInManager;
    private readonly ITokenService _tokenService;
    private readonly AppDbContext _dbContext;

    public AuthController(
        UserManager<ApplicationUser> userManager,
        SignInManager<ApplicationUser> signInManager,
        ITokenService tokenService,
        AppDbContext dbContext)
    {
        _userManager = userManager;
        _signInManager = signInManager;
        _tokenService = tokenService;
        _dbContext = dbContext;
    }

    [HttpPost("login")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(TokenResponse), StatusCodes.Status200OK)]
    public async Task<IActionResult> Login(LoginRequest request, CancellationToken cancellationToken)
    {
        var user = await FindUserByLoginAsync(request.Login);
        if (user is null || !user.IsActive || !user.EmailConfirmed)
        {
            return Unauthorized(new { message = "Invalid credentials." });
        }

        var signInResult = await _signInManager.CheckPasswordSignInAsync(user, request.Password, lockoutOnFailure: true);
        if (!signInResult.Succeeded)
        {
            return Unauthorized(new { message = "Invalid credentials." });
        }

        var tokenResponse = await _tokenService.CreateTokenResponseAsync(
            user,
            HttpContext.Connection.RemoteIpAddress?.ToString(),
            cancellationToken);

        SetRefreshTokenCookie(tokenResponse.RefreshToken, tokenResponse.RefreshTokenExpiresAtUtc);
        return Ok(tokenResponse);
    }

    [HttpPost("refresh")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(TokenResponse), StatusCodes.Status200OK)]
    public async Task<IActionResult> Refresh(CancellationToken cancellationToken)
    {
        var refreshTokenValue = Request.Cookies[RefreshTokenCookieName];
        if (string.IsNullOrWhiteSpace(refreshTokenValue))
        {
            return Unauthorized(new { message = "Invalid refresh token." });
        }

        var refreshTokenHash = _tokenService.HashToken(refreshTokenValue);
        var refreshToken = await _dbContext.RefreshTokens
            .Include(token => token.User)
            .SingleOrDefaultAsync(token => token.TokenHash == refreshTokenHash, cancellationToken);

        if (refreshToken is null || !refreshToken.IsActive || !refreshToken.User.IsActive)
        {
            return Unauthorized(new { message = "Invalid refresh token." });
        }

        refreshToken.RevokedAtUtc = DateTime.UtcNow;
        refreshToken.RevokedByIp = HttpContext.Connection.RemoteIpAddress?.ToString();

        var tokenResponse = await _tokenService.CreateTokenResponseAsync(
            refreshToken.User,
            HttpContext.Connection.RemoteIpAddress?.ToString(),
            cancellationToken);

        refreshToken.ReplacedByTokenHash = _tokenService.HashToken(tokenResponse.RefreshToken);
        await _dbContext.SaveChangesAsync(cancellationToken);

        SetRefreshTokenCookie(tokenResponse.RefreshToken, tokenResponse.RefreshTokenExpiresAtUtc);
        return Ok(tokenResponse);
    }

    [HttpPost("logout")]
    [Authorize]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    public async Task<IActionResult> Logout(CancellationToken cancellationToken)
    {
        var userIdRaw = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!Guid.TryParse(userIdRaw, out var userId))
        {
            DeleteRefreshTokenCookie();
            return NoContent();
        }

        var refreshTokenValue = Request.Cookies[RefreshTokenCookieName];
        if (!string.IsNullOrWhiteSpace(refreshTokenValue))
        {
            var refreshTokenHash = _tokenService.HashToken(refreshTokenValue);
            var refreshToken = await _dbContext.RefreshTokens
                .SingleOrDefaultAsync(token => token.TokenHash == refreshTokenHash && token.UserId == userId, cancellationToken);

            if (refreshToken is not null && refreshToken.IsActive)
            {
                refreshToken.RevokedAtUtc = DateTime.UtcNow;
                refreshToken.RevokedByIp = HttpContext.Connection.RemoteIpAddress?.ToString();
                await _dbContext.SaveChangesAsync(cancellationToken);
            }
        }

        DeleteRefreshTokenCookie();
        return NoContent();
    }

    [HttpPost("request-email-confirmation")]
    [AllowAnonymous]
    public async Task<IActionResult> RequestEmailConfirmation(RequestEmailConfirmationRequest request)
    {
        var user = await FindUserByLoginAsync(request.Login);
        if (user is null || user.EmailConfirmed)
        {
            return Ok(new { message = "If the account exists, a confirmation token was generated." });
        }

        await _userManager.GenerateEmailConfirmationTokenAsync(user);
        return Ok(new { message = "If the account exists, a confirmation token was generated." });
    }

    [HttpPost("confirm-email")]
    [AllowAnonymous]
    public async Task<IActionResult> ConfirmEmail(ConfirmEmailRequest request)
    {
        var user = await FindUserByLoginAsync(request.Login);
        if (user is null)
        {
            return BadRequest(new { message = "Invalid login or token." });
        }

        var result = await _userManager.ConfirmEmailAsync(user, request.Token);
        if (!result.Succeeded)
        {
            return BadRequest(new
            {
                message = "Email confirmation failed.",
                errors = result.Errors.Select(error => error.Description)
            });
        }

        return Ok(new { message = "Email confirmed." });
    }

    [HttpPost("forgot-password")]
    [AllowAnonymous]
    public async Task<IActionResult> ForgotPassword(ForgotPasswordRequest request)
    {
        var user = await FindUserByLoginAsync(request.Login);
        if (user is null || !user.EmailConfirmed)
        {
            return Ok(new { message = "If the account exists, a reset token was generated." });
        }

        await _userManager.GeneratePasswordResetTokenAsync(user);
        return Ok(new { message = "If the account exists, a reset token was generated." });
    }

    [HttpPost("reset-password")]
    [AllowAnonymous]
    public async Task<IActionResult> ResetPassword(ResetPasswordRequest request)
    {
        var user = await FindUserByLoginAsync(request.Login);
        if (user is null)
        {
            return BadRequest(new { message = "Invalid login or token." });
        }

        var result = await _userManager.ResetPasswordAsync(user, request.Token, request.NewPassword);
        if (!result.Succeeded)
        {
            return BadRequest(new
            {
                message = "Password reset failed.",
                errors = result.Errors.Select(error => error.Description)
            });
        }

        return Ok(new { message = "Password has been reset." });
    }

    [HttpGet("me")]
    [Authorize]
    [ProducesResponseType(typeof(CurrentUserResponse), StatusCodes.Status200OK)]
    public async Task<IActionResult> Me()
    {
        var userIdRaw = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!Guid.TryParse(userIdRaw, out var userId))
        {
            return Unauthorized();
        }

        var user = await _userManager.Users.SingleOrDefaultAsync(candidate => candidate.Id == userId);
        if (user is null)
        {
            return Unauthorized();
        }

        var roles = await _userManager.GetRolesAsync(user);
        return Ok(new CurrentUserResponse
        {
            Id = user.Id,
            Email = user.Email ?? string.Empty,
            FirstName = user.FirstName,
            LastName = user.LastName,
            IsActive = user.IsActive,
            Roles = roles
        });
    }

    private void SetRefreshTokenCookie(string refreshToken, DateTime expiresAtUtc)
    {
        Response.Cookies.Append(RefreshTokenCookieName, refreshToken, new CookieOptions
        {
            HttpOnly = true,
            Secure = Request.IsHttps,
            SameSite = SameSiteMode.Lax,
            Path = "/api/auth",
            Expires = expiresAtUtc
        });
    }

    private void DeleteRefreshTokenCookie()
    {
        Response.Cookies.Delete(RefreshTokenCookieName, new CookieOptions
        {
            Secure = Request.IsHttps,
            SameSite = SameSiteMode.Lax,
            Path = "/api/auth"
        });
    }

    private async Task<ApplicationUser?> FindUserByLoginAsync(string login)
    {
        var normalizedLogin = login.Trim();
        return await _userManager.FindByNameAsync(normalizedLogin) ?? await _userManager.FindByEmailAsync(normalizedLogin);
    }
}
