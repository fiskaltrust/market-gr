using Azure.Monitor.OpenTelemetry.AspNetCore;
using OpenTelemetry.Logs;
using OpenTelemetry.Resources;
using OpenTelemetry.Trace;
using OpenTelemetry.Metrics;
using Azure.Monitor.OpenTelemetry.Exporter;

namespace fiskaltrust.Api.Government.GR.Extensions;

public static class LoggingExt
{
    public static IServiceCollection RegisterOpenTelemetryServices(this IServiceCollection services, IConfiguration configuration, string serviceName)
    {
        var tracingOtlpEndpoint = configuration["OpenTelemetry:EndpointUrl"];
        var otelConnectionString = configuration["AzureMonitor:ConnectionString"];

        services.AddHttpContextAccessor();
        var otel = services.AddOpenTelemetry();

        otel.ConfigureResource(resource => resource
            .AddService(serviceName));

        if (!string.IsNullOrEmpty(otelConnectionString))
        {
            otel.UseAzureMonitor(options =>
            {
                options.ConnectionString = otelConnectionString;
                options.EnableLiveMetrics = true;
            });
            otel.WithLogging(logging => logging.AddAzureMonitorLogExporter(options => options.ConnectionString = otelConnectionString));
            otel.WithTracing(tracing =>
            {
                tracing.AddAzureMonitorTraceExporter(options =>
                {
                    options.ConnectionString = otelConnectionString;
                });
                if (tracingOtlpEndpoint != null)
                {
                    tracing.AddOtlpExporter(otlpOptions =>
                    {
                        otlpOptions.Endpoint = new Uri(tracingOtlpEndpoint);
                    });
                }
            });
        }

        return services;
    }


    public static IServiceCollection AddCustomLogging(this IServiceCollection services) =>
       services.AddLogging(configure =>
       {
           configure.AddConsole(options => options.LogToStandardErrorThreshold = LogLevel.Error);
       });
}
