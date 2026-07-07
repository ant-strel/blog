namespace AuthServer.Api.Contracts.Dashboard;

public class DashboardFilterOptionResponse
{
    public string Id { get; set; } = string.Empty;
    public string Label { get; set; } = string.Empty;
    public int Count { get; set; }
}
