namespace AuthServer.Api.Contracts.Dashboard;

public class DashboardTimelineEventResponse
{
    public string Id { get; set; } = string.Empty;
    public DateTime TimestampUtc { get; set; }
    public string Title { get; set; } = string.Empty;
    public string SessionId { get; set; } = string.Empty;
    public string ActivityType { get; set; } = string.Empty;
    public string Severity { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public string Environment { get; set; } = string.Empty;
    public string Summary { get; set; } = string.Empty;
}
