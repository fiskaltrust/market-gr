namespace fiskaltrust.Api.Government.GR;

public class AppSettings
{
    public MyDataSettings MyData { get; set; } = new();
}

public class MyDataSettings
{
    public string BaseUrl { get; set; } = "https://mydatapi.aade.gr/myDATA/";

    public string DevBaseUrl { get; set; } = "https://mydataapidev.aade.gr/myDATA/";

    public string AadeUserId { get; set; } = "";

    public string SubscriptionKey { get; set; } = "";
}
