namespace AuthServer.Api.Contracts.Dashboard;

public class DashboardSummaryResponse
{
    public IList<DashboardMetricResponse> Metrics { get; set; } = [];
    public int ActiveSessions { get; set; }
    public DashboardFiltersResponse Filters { get; set; } = new();
}
