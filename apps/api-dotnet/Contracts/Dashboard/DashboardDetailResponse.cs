namespace AuthServer.Api.Contracts.Dashboard;

public class DashboardDetailResponse
{
    public string Id { get; set; } = string.Empty;
    public string CorrelationId { get; set; } = string.Empty;
    public string Actor { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Recommendation { get; set; } = string.Empty;
    public IList<string> RelatedAlerts { get; set; } = [];
}
