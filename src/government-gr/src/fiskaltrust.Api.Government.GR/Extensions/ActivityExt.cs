namespace fiskaltrust.Api.Government.GR.Extensions;

public static class ActivityExt
{
    public static void SetTags(this System.Diagnostics.Activity activity, string? value, IEnumerable<string> tags)
    {
        if (value is null) { return; }

        foreach (var tag in tags)
        {
            activity?.SetTag(tag, value);
        }
    }
}
