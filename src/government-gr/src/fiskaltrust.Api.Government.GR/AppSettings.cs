namespace fiskaltrust.Api.Government.GR;

public class AppSettings
{
    public required ConnectionStrings ConnectionStrings { get; set; }

    public MyDataSettings MyData { get; set; } = new();
}

public class ConnectionStrings
{
    public required string ReadOnlySQL { get; set; }
}

public class MyDataSettings
{
    public string BaseUrl { get; set; } = "https://mydatapi.aade.gr/myDATA/";

    public string DevBaseUrl { get; set; } = "https://mydataapidev.aade.gr/myDATA/";
}
