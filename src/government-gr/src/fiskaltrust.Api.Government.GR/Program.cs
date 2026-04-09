using Azure.Monitor.OpenTelemetry.Exporter;
using fiskaltrust.Api.Government.GR;
using fiskaltrust.Api.Government.GR.Authentication;
using fiskaltrust.Api.Government.GR.Extensions;
using fiskaltrust.Api.Government.GR.Interfaces;
using fiskaltrust.Api.Government.GR.MyData;
using fiskaltrust.Api.Government.GR.Services;
using fiskaltrust.Api.Government.GR.Telemetry;
using Microsoft.Extensions.Options;
using OpenTelemetry;
using OpenTelemetry.Logs;
using OpenTelemetry.Metrics;
using OpenTelemetry.Resources;
using OpenTelemetry.Trace;
using System.Reflection;

var builder = WebApplication.CreateBuilder(args);

builder.Configuration.AddEnvironmentVariables();
builder.Services.Configure<AppSettings>(builder.Configuration);
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddProblemDetails(options =>
{
    options.CustomizeProblemDetails = context =>
    {
        context.ProblemDetails.Instance = context.HttpContext.Request.Path;
        context.ProblemDetails.Extensions["traceId"] = context.HttpContext.TraceIdentifier;
    };
});
builder.Services.AddScoped<ICommonContextRepository>(sp => new CommonContextRepository(sp.GetRequiredService<IOptions<AppSettings>>().Value.ConnectionStrings.ReadOnlySQL));
builder.Services.AddScoped<ICashboxAuthenticationService, CashboxAuthenticationService>();
builder.Services.AddScoped<IAccountAuthenticationService, AccountAuthenticationService>();

builder.Services.AddHttpClient<IMyDataClient, MyDataClient>((sp, client) =>
{
    var settings = sp.GetRequiredService<IOptions<AppSettings>>().Value.MyData;
    client.BaseAddress = new Uri(settings.BaseUrl);
});

builder.Services.AddAuthentication(options => options.DefaultScheme = "CashBoxAccessToken")
    .AddScheme<FiskaltrustAuthenticationSchemeOptions, FiskaltrustAccessTokenAuthenticationSchemeHandler>("CashBoxAccessToken", opts => { });

builder.Services.AddAuthorization();

const string serviceName = "fiskaltrust.Api.Government.GR";
builder.Services.AddHttpContextAccessor();
var otel = builder.Services.AddOpenTelemetry()
    .ConfigureResource(resource => resource.AddService(serviceName))
    .WithTracing(tracing =>
        tracing
            .AddAspNetCoreInstrumentation(options =>
            {
                options.Filter = context => !(context.Request?.Path.Value.Contains("health") ?? false);

                options.EnrichWithHttpRequest = (activity, httpRequestMessage) =>
                {
                    activity.SetTags(httpRequestMessage.ExtractFromHeaders(["cashboxid", "x-cashbox-id"]), ["cashbox.id", "enduser.id", "user.id"]);
                    activity.SetTags(httpRequestMessage.ExtractFromHeaders(["account", "x-account-id"]), ["account.id", "enduser.id", "user.id"]);
                };
                options.RecordException = true;
            })
            .AddHttpClientInstrumentation(options =>
            {
                options.RecordException = true;
            })
            .AddSource(serviceName)
            .AddProcessor<ActivityEnrichingProcessor>()
            .AddSource(serviceName, "fiskaltrust.Api.Government.GR")
    )
    .WithMetrics(metrics =>
    {
        metrics.AddAspNetCoreInstrumentation().AddMeter("fiskaltrust.Api.Government.GR");
        metrics.AddMeter("Microsoft.AspNetCore.Hosting");
        metrics.AddMeter("Microsoft.AspNetCore.Server.Kestrel");
    })
    .WithLogging(logging =>
    {
        logging.SetResourceBuilder(ResourceBuilder.CreateDefault().AddService(serviceName));
    });

var otelConnectionString = builder.Configuration["ConnectionStrings:AzureMonitor"];
if (!string.IsNullOrEmpty(otelConnectionString))
{
    otel.UseAzureMonitorExporter(options =>
    {
        options.ConnectionString = otelConnectionString;
        options.EnableLiveMetrics = true;
    });
}

var otlpEndpoint = builder.Configuration["OTEL_EXPORTER_OTLP_ENDPOINT"];
if (!string.IsNullOrEmpty(otlpEndpoint))
{
    otel.UseOtlpExporter(builder.Configuration["OTEL_EXPORTER_OTLP_PROTOCOL"] switch
    {
        "grpc" => OpenTelemetry.Exporter.OtlpExportProtocol.Grpc,
        _ => OpenTelemetry.Exporter.OtlpExportProtocol.HttpProtobuf
    }, new Uri(otlpEndpoint));
}
builder.Services.AddCustomLogging();

var app = builder.Build();

app.UseExceptionHandler();
app.UseStatusCodePages();

app.UseHttpsRedirection();
app.UseAuthentication();
app.UseAuthorization();

app.MapMyDataEndpoints();

app.MapGroup("/")
    .UseVersionApi()
    .WithTags("Service metadata")
    .AllowAnonymous();
app.Run();

// Make Program class accessible for integration tests
public partial class Program { }
