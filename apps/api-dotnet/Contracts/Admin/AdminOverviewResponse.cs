using AuthServer.Api.Contracts.Dashboard;

namespace AuthServer.Api.Contracts.Admin;

public class AdminOverviewResponse
{
    public string Health { get; set; } = string.Empty;
    public IList<DashboardMetricResponse> Cards { get; set; } = [];
    public IList<AdminOverviewItemResponse> Queues { get; set; } = [];
    public IList<AdminOverviewItemResponse> Alerts { get; set; } = [];
}
