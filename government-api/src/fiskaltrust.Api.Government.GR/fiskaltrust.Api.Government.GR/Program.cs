using System.Net.Http.Headers;
using static System.Net.Mime.MediaTypeNames;

var builder = WebApplication.CreateBuilder(args);

// Configuration: external base URLs
builder.Configuration.AddInMemoryCollection(new Dictionary<string, string?>
{
    ["MyData:BaseUrl"] = "https://mydatapi.aade.gr/myDATA/",
    ["MyData:DevBaseUrl"] = "https://mydataapidev.aade.gr/"
});

builder.Services.AddHttpClient("mydataClient", (sp, client) =>
{
    var cfg = sp.GetRequiredService<IConfiguration>();
    client.BaseAddress = new Uri(cfg["MyData:BaseUrl"]!);
    client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/xml"));
});

var app = builder.Build();

// POST endpoints
// app.MapPost("/SendInvoices");
// app.MapPost("/SendIncomeClassification");
// app.MapPost("/SendExpensesClassification");
// app.MapPost("/SendPaymentsMethod");
// app.MapPost("/CancelInvoice");

// GET endpoints
app.MapGet("/RequestDocs", async ctx =>
{
    // https://mydatapi.aade.gr/myDATA/RequestDocs?mark={mark}[&dateFrom][&dateTo][&entityVatNumber][&counterVatNumber][&invType][&maxMark][&nextPartitionKey][&nextRowKey]
    var qs = ctx.Request.QueryString.Value;
    await ForwardAsync(ctx, $"RequestDocs{qs}", HttpMethod.Get);
});
app.MapGet("/RequestTransmittedDocs", async ctx =>
{
    var qs = ctx.Request.QueryString.Value;
    await ForwardAsync(ctx, $"RequestTransmittedDocs{qs}", HttpMethod.Get);
});
app.MapGet("/RequestMyIncome", async ctx =>
{
    var qs = ctx.Request.QueryString.Value;
    await ForwardAsync(ctx, $"RequestMyIncome{qs}", HttpMethod.Get);
});
app.MapGet("/RequestMyExpenses", async ctx =>
{
    var qs = ctx.Request.QueryString.Value;
    await ForwardAsync(ctx, $"RequestMyExpenses{qs}", HttpMethod.Get);
});
app.MapGet("/RequestVatInfo", async ctx =>
{
    var qs = ctx.Request.QueryString.Value;
    await ForwardAsync(ctx, $"RequestVatInfo{qs}", HttpMethod.Get);
});

app.Run();
