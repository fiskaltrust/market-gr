using System.Reflection;

public static class VersionApi
{
    public static RouteGroupBuilder UseVersionApi(this RouteGroupBuilder group)
    {
        group.MapGet("/version", GetVersion)
            .Produces<string[]>(StatusCodes.Status200OK, "application/json");

        return group;
    }

    private static string[] GetVersion()
    {
        var assembly = Assembly.GetExecutingAssembly();
        var assemblyName = assembly.GetName();
        var name = assemblyName.Name ?? "";
        var version = assembly.GetCustomAttribute<AssemblyInformationalVersionAttribute>()?.InformationalVersion
                      ?? assemblyName.Version?.ToString()
                      ?? "";
        return new[] { name, version, "", "" };
    }
}
