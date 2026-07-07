using AuthServer.Api.Contracts.Admin;
using AuthServer.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AuthServer.Api.Controllers;

[ApiController]
[Route("api/admin")]
[Authorize]
public class AdminController : ControllerBase
{
    private readonly ISyntheticDashboardService _dashboardService;

    public AdminController(ISyntheticDashboardService dashboardService)
    {
        _dashboardService = dashboardService;
    }

    [HttpGet("overview")]
    [ProducesResponseType(typeof(AdminOverviewResponse), StatusCodes.Status200OK)]
    public IActionResult Overview()
    {
        return Ok(_dashboardService.GetAdminOverview());
    }
}
