namespace fiskaltrust.Api.Government.GR.Extensions;

public static class HttpExt
{
    public static string? ExtractFromHeaders(this HttpRequest request, IEnumerable<string> keys)
    {
        foreach (var key in keys)
        {
            if (request.Headers.TryGetValue(key, out var value))
            {
                return value;
            }
        }
        return null;
    }
}
