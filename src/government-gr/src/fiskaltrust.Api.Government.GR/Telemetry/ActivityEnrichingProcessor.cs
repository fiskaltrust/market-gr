using System.Diagnostics;
using fiskaltrust.Api.Government.GR.Extensions;
using OpenTelemetry;

namespace fiskaltrust.Api.Government.GR.Telemetry;

public class ActivityEnrichingProcessor : BaseProcessor<Activity>
{
    private readonly IHttpContextAccessor _httpContextAccessor;

    public ActivityEnrichingProcessor(IHttpContextAccessor httpContextAccessor)
    {
        _httpContextAccessor = httpContextAccessor;
    }

    public override void OnEnd(Activity activity)
    {
        if (_httpContextAccessor?.HttpContext is null || !_httpContextAccessor.HttpContext.Request.Path.HasValue) { return; }

        if (_httpContextAccessor!.HttpContext.Request.Path.Value?.Contains("health") ?? false)
        {
            activity.ActivityTraceFlags &= ~ActivityTraceFlags.Recorded;
        }

        activity.SetTags(_httpContextAccessor!.HttpContext.Request.ExtractFromHeaders(["cashboxid", "x-cashbox-id"]), ["cashbox.id", "enduser.id", "user.id"]);
    }
}
