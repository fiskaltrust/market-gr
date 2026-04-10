using System.Diagnostics;
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

        var userId = _httpContextAccessor.HttpContext.User?.Identity?.Name;
        if (!string.IsNullOrEmpty(userId))
        {
            activity.SetTag("enduser.id", userId);
        }
    }
}
