namespace AuthServer.Api.Contracts.Dashboard;

public class DashboardFiltersResponse
{
    public IList<DashboardFilterOptionResponse> Environments { get; set; } = [];
    public IList<DashboardFilterOptionResponse> Severities { get; set; } = [];
    public IList<DashboardFilterOptionResponse> Statuses { get; set; } = [];
}
