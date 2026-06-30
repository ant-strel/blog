namespace AuthServer.Api.Contracts.Dashboard;

public class DashboardMetricResponse
{
    public string Id { get; set; } = string.Empty;
    public string Label { get; set; } = string.Empty;
    public string Value { get; set; } = string.Empty;
    public string Delta { get; set; } = string.Empty;
    public string Trend { get; set; } = string.Empty;
}
