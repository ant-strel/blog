using AuthServer.Api.Contracts.Admin;
using AuthServer.Api.Contracts.Dashboard;

namespace AuthServer.Api.Services;

public interface ISyntheticDashboardService
{
    DashboardSummaryResponse GetSummary();
    DashboardTimelineResponse GetTimeline(string? search, string? severity, string? environment, string? status);
    DashboardDetailResponse? GetDetail(string id);
    AdminOverviewResponse GetAdminOverview();
}
