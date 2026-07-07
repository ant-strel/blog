using AuthServer.Api.Contracts.Dashboard;
using AuthServer.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AuthServer.Api.Controllers;

[ApiController]
[Route("api/dashboard")]
[Authorize]
public class DashboardController : ControllerBase
{
    private readonly ISyntheticDashboardService _dashboardService;

    public DashboardController(ISyntheticDashboardService dashboardService)
    {
        _dashboardService = dashboardService;
    }

    [HttpGet("summary")]
    [ProducesResponseType(typeof(DashboardSummaryResponse), StatusCodes.Status200OK)]
    public IActionResult Summary()
    {
        return Ok(_dashboardService.GetSummary());
    }

    [HttpGet("timeline")]
    [ProducesResponseType(typeof(DashboardTimelineResponse), StatusCodes.Status200OK)]
    public IActionResult Timeline(
        [FromQuery] string? search = null,
        [FromQuery] string? severity = null,
        [FromQuery] string? environment = null,
        [FromQuery] string? status = null)
    {
        return Ok(_dashboardService.GetTimeline(search, severity, environment, status));
    }

    [HttpGet("details/{id}")]
    [ProducesResponseType(typeof(DashboardDetailResponse), StatusCodes.Status200OK)]
    public IActionResult Details([FromRoute] string id)
    {
        var detail = _dashboardService.GetDetail(id);
        return detail is null ? NotFound(new { message = "Dashboard detail not found." }) : Ok(detail);
    }
}
