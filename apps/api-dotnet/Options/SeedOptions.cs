namespace AuthServer.Api.Options;

public class SeedOptions
{
    public const string SectionName = "Seed";

    public string EditorEmail { get; set; } = "editor@example.com";

    public string EditorPassword { get; set; } = "Editor123!";

    public string EditorFirstName { get; set; } = "Editorial";

    public string EditorLastName { get; set; } = "Owner";
}
