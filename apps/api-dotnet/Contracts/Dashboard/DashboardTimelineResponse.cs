namespace AuthServer.Api.Contracts.Dashboard;

public class DashboardTimelineResponse
{
    public IList<DashboardTimelineEventResponse> Items { get; set; } = [];
    public int FilteredCount { get; set; }
}
