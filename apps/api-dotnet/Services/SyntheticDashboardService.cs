using AuthServer.Api.Contracts.Admin;
using AuthServer.Api.Contracts.Dashboard;

namespace AuthServer.Api.Services;

public class SyntheticDashboardService : ISyntheticDashboardService
{
    private static readonly DashboardSummaryResponse Summary = new()
    {
        ActiveSessions = 128,
        Metrics =
        [
            new() { Id = "sessions", Label = "Active sessions", Value = "128", Delta = "+12%", Trend = "up" },
            new() { Id = "alerts", Label = "Open alerts", Value = "7", Delta = "-2", Trend = "down" },
            new() { Id = "latency", Label = "API p95", Value = "184 ms", Delta = "+14 ms", Trend = "up" },
            new() { Id = "resolution", Label = "Resolution rate", Value = "93%", Delta = "flat", Trend = "flat" }
        ],
        Filters = new DashboardFiltersResponse
        {
            Environments =
            [
                new() { Id = "prod", Label = "Production", Count = 9 },
                new() { Id = "stage", Label = "Stage", Count = 4 },
                new() { Id = "dev", Label = "Dev", Count = 3 }
            ],
            Severities =
            [
                new() { Id = "critical", Label = "Critical", Count = 2 },
                new() { Id = "warning", Label = "Warning", Count = 8 },
                new() { Id = "info", Label = "Info", Count = 6 }
            ],
            Statuses =
            [
                new() { Id = "open", Label = "Open", Count = 9 },
                new() { Id = "monitoring", Label = "Monitoring", Count = 4 },
                new() { Id = "resolved", Label = "Resolved", Count = 3 }
            ]
        }
    };

    private static readonly List<DashboardTimelineEventResponse> Timeline =
    [
        new()
        {
            Id = "evt-1001",
            TimestampUtc = DateTime.Parse("2026-06-29T08:15:00Z"),
            Title = "Payment webhook spike",
            SessionId = "sess-14",
            ActivityType = "webhook",
            Severity = "critical",
            Status = "open",
            Environment = "prod",
            Summary = "Retry storms started after upstream timeout window."
        },
        new()
        {
            Id = "evt-1002",
            TimestampUtc = DateTime.Parse("2026-06-29T08:22:00Z"),
            Title = "Search index delay",
            SessionId = "sess-22",
            ActivityType = "indexer",
            Severity = "warning",
            Status = "monitoring",
            Environment = "stage",
            Summary = "Synthetic queue depth crossed the dashboard warning threshold."
        },
        new()
        {
            Id = "evt-1003",
            TimestampUtc = DateTime.Parse("2026-06-29T08:41:00Z"),
            Title = "Manual feature-flag audit",
            SessionId = "sess-41",
            ActivityType = "admin",
            Severity = "info",
            Status = "resolved",
            Environment = "prod",
            Summary = "Operator reviewed rollout guardrails before widening exposure."
        },
        new()
        {
            Id = "evt-1004",
            TimestampUtc = DateTime.Parse("2026-06-29T09:02:00Z"),
            Title = "Token refresh anomaly",
            SessionId = "sess-55",
            ActivityType = "auth",
            Severity = "warning",
            Status = "open",
            Environment = "prod",
            Summary = "Refresh-token reuse attempt was blocked by session policy."
        }
    ];

    private static readonly Dictionary<string, DashboardDetailResponse> Details = new()
    {
        ["evt-1001"] = new()
        {
            Id = "evt-1001",
            CorrelationId = "corr-prod-1842",
            Actor = "worker-dotnet",
            Title = "Payment webhook spike",
            Description = "Synthetic upstream latency pushed webhook retries into a burst window affecting payment callbacks.",
            Recommendation = "Throttle retry fan-out and inspect upstream gateway saturation.",
            RelatedAlerts = ["alert-payments-1", "alert-payments-2"]
        },
        ["evt-1002"] = new()
        {
            Id = "evt-1002",
            CorrelationId = "corr-stage-992",
            Actor = "dashboard-indexer",
            Title = "Search index delay",
            Description = "Index queue depth exceeded the stage threshold while demo data refresh was running.",
            Recommendation = "Inspect worker lag and pause low-priority replay tasks.",
            RelatedAlerts = ["alert-search-1"]
        },
        ["evt-1003"] = new()
        {
            Id = "evt-1003",
            CorrelationId = "corr-admin-447",
            Actor = "superadmin@example.com",
            Title = "Manual feature-flag audit",
            Description = "The operator reviewed production rollout controls and verified no destructive flags were enabled.",
            Recommendation = "No action required.",
            RelatedAlerts = []
        },
        ["evt-1004"] = new()
        {
            Id = "evt-1004",
            CorrelationId = "corr-auth-811",
            Actor = "auth-gateway",
            Title = "Token refresh anomaly",
            Description = "A reused refresh token was detected and revoked during session continuation.",
            Recommendation = "Review suspicious IP activity and correlate with login attempts.",
            RelatedAlerts = ["alert-auth-3"]
        }
    };

    private static readonly AdminOverviewResponse AdminOverview = new()
    {
        Health = "healthy",
        Cards =
        [
            new() { Id = "users", Label = "Managed users", Value = "2,184", Delta = "+34", Trend = "up" },
            new() { Id = "jobs", Label = "Job success rate", Value = "99.2%", Delta = "+0.4%", Trend = "up" },
            new() { Id = "backups", Label = "Last backup", Value = "09:10 UTC", Delta = "on time", Trend = "flat" },
            new() { Id = "flags", Label = "Active flags", Value = "12", Delta = "+1", Trend = "up" }
        ],
        Queues =
        [
            new() { Id = "queue-1", Title = "Content moderation", Status = "healthy", Summary = "14 items waiting, no SLA breach." },
            new() { Id = "queue-2", Title = "License sync", Status = "monitoring", Summary = "2 retries pending after gateway slowdown." }
        ],
        Alerts =
        [
            new() { Id = "admin-alert-1", Title = "Audit export", Status = "review", Summary = "Sensitive export generated in demo mode." },
            new() { Id = "admin-alert-2", Title = "Support queue", Status = "healthy", Summary = "No overdue escalations." }
        ]
    };

    public DashboardSummaryResponse GetSummary() => Summary;

    public DashboardTimelineResponse GetTimeline(string? search, string? severity, string? environment, string? status)
    {
        IEnumerable<DashboardTimelineEventResponse> items = Timeline;

        if (!string.IsNullOrWhiteSpace(search))
        {
            var needle = search.Trim().ToLowerInvariant();
            items = items.Where(item =>
                $"{item.Title} {item.Summary} {item.ActivityType}".ToLowerInvariant().Contains(needle));
        }

        if (!string.IsNullOrWhiteSpace(severity))
        {
            items = items.Where(item => item.Severity.Equals(severity, StringComparison.OrdinalIgnoreCase));
        }

        if (!string.IsNullOrWhiteSpace(environment))
        {
            items = items.Where(item => item.Environment.Equals(environment, StringComparison.OrdinalIgnoreCase));
        }

        if (!string.IsNullOrWhiteSpace(status))
        {
            items = items.Where(item => item.Status.Equals(status, StringComparison.OrdinalIgnoreCase));
        }

        var materialized = items.OrderByDescending(item => item.TimestampUtc).ToList();
        return new DashboardTimelineResponse
        {
            Items = materialized,
            FilteredCount = materialized.Count
        };
    }

    public DashboardDetailResponse? GetDetail(string id)
    {
        return Details.GetValueOrDefault(id);
    }

    public AdminOverviewResponse GetAdminOverview() => AdminOverview;
}
