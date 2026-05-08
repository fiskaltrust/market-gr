using System.Net.Http.Headers;

var builder = WebApplication.CreateBuilder(args);

builder.Configuration.AddInMemoryCollection(new Dictionary<string, string?>
{
    ["MyData:ErpBaseUrl"] = "https://mydatapi.aade.gr/myDATA/",
    ["MyData:ProviderBaseUrl"] = "https://mydatapi.aade.gr/myDataProvider/",
    ["MyData:ErpDevBaseUrl"] = "https://mydataapidev.aade.gr/",
    ["MyData:ProviderDevBaseUrl"] = "https://mydataapidev.aade.gr/myDataProvider/"
});

builder.Services.AddHttpClient(MyDataClients.Erp, (sp, client) =>
{
    var cfg = sp.GetRequiredService<IConfiguration>();
    client.BaseAddress = new Uri(cfg["MyData:ErpBaseUrl"]!);
    client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/xml"));
});

builder.Services.AddHttpClient(MyDataClients.Provider, (sp, client) =>
{
    var cfg = sp.GetRequiredService<IConfiguration>();
    client.BaseAddress = new Uri(cfg["MyData:ProviderBaseUrl"]!);
    client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/xml"));
});

var app = builder.Build();

var erp = app.MapGroup("/mydata/erp");
erp.MapPost("/SendInvoices", (HttpContext ctx, IHttpClientFactory f) => Forward(ctx, f, MyDataClients.Erp, HttpMethod.Post, "SendInvoices"));
erp.MapPost("/SendIncomeClassification", (HttpContext ctx, IHttpClientFactory f) => Forward(ctx, f, MyDataClients.Erp, HttpMethod.Post, "SendIncomeClassification"));
erp.MapPost("/SendExpensesClassification", (HttpContext ctx, IHttpClientFactory f) => Forward(ctx, f, MyDataClients.Erp, HttpMethod.Post, "SendExpensesClassification"));
erp.MapPost("/SendPaymentsMethod", (HttpContext ctx, IHttpClientFactory f) => Forward(ctx, f, MyDataClients.Erp, HttpMethod.Post, "SendPaymentsMethod"));
erp.MapPost("/CancelInvoice", (HttpContext ctx, IHttpClientFactory f) => Forward(ctx, f, MyDataClients.Erp, HttpMethod.Post, "CancelInvoice"));
erp.MapGet("/RequestDocs", (HttpContext ctx, IHttpClientFactory f) => Forward(ctx, f, MyDataClients.Erp, HttpMethod.Get, "RequestDocs"));
erp.MapGet("/RequestTransmittedDocs", (HttpContext ctx, IHttpClientFactory f) => Forward(ctx, f, MyDataClients.Erp, HttpMethod.Get, "RequestTransmittedDocs"));
erp.MapGet("/RequestMyIncome", (HttpContext ctx, IHttpClientFactory f) => Forward(ctx, f, MyDataClients.Erp, HttpMethod.Get, "RequestMyIncome"));
erp.MapGet("/RequestMyExpenses", (HttpContext ctx, IHttpClientFactory f) => Forward(ctx, f, MyDataClients.Erp, HttpMethod.Get, "RequestMyExpenses"));
erp.MapGet("/RequestVatInfo", (HttpContext ctx, IHttpClientFactory f) => Forward(ctx, f, MyDataClients.Erp, HttpMethod.Get, "RequestVatInfo"));
erp.MapGet("/RequestE3Info", (HttpContext ctx, IHttpClientFactory f) => Forward(ctx, f, MyDataClients.Erp, HttpMethod.Get, "RequestE3Info"));
erp.MapPost("/RegisterTransfer", (HttpContext ctx, IHttpClientFactory f) => Forward(ctx, f, MyDataClients.Erp, HttpMethod.Post, "RegisterTransfer"));
erp.MapPost("/ConfirmDeliveryOutcome", (HttpContext ctx, IHttpClientFactory f) => Forward(ctx, f, MyDataClients.Erp, HttpMethod.Post, "ConfirmDeliveryOutcome"));
erp.MapPost("/RejectDeliveryNote", (HttpContext ctx, IHttpClientFactory f) => Forward(ctx, f, MyDataClients.Erp, HttpMethod.Post, "RejectDeliveryNote"));
erp.MapGet("/GetDeliveryNoteStatus", (HttpContext ctx, IHttpClientFactory f) => Forward(ctx, f, MyDataClients.Erp, HttpMethod.Get, "GetDeliveryNoteStatus"));
erp.MapPost("/GenerateGroupQRCode", (HttpContext ctx, IHttpClientFactory f) => Forward(ctx, f, MyDataClients.Erp, HttpMethod.Post, "GenerateGroupQRCode"));
erp.MapGet("/RequestGroupQRDetails", (HttpContext ctx, IHttpClientFactory f) => Forward(ctx, f, MyDataClients.Erp, HttpMethod.Get, "RequestGroupQRDetails"));

var provider = app.MapGroup("/mydata/einvoiceprovider");
provider.MapPost("/SendInvoices", (HttpContext ctx, IHttpClientFactory f) => Forward(ctx, f, MyDataClients.Provider, HttpMethod.Post, "SendInvoices"));
provider.MapGet("/RequestTransmittedDocs", (HttpContext ctx, IHttpClientFactory f) => Forward(ctx, f, MyDataClients.Provider, HttpMethod.Get, "RequestTransmittedDocs"));
provider.MapGet("/RequestReceiverInfo", (HttpContext ctx, IHttpClientFactory f) => Forward(ctx, f, MyDataClients.Provider, HttpMethod.Get, "RequestReceiverInfo"));
provider.MapPost("/SendUnsignedInvoices", (HttpContext ctx, IHttpClientFactory f) => Forward(ctx, f, MyDataClients.Provider, HttpMethod.Post, "SendUnsignedInvoices"));
provider.MapPost("/SendPaymentsMethod", (HttpContext ctx, IHttpClientFactory f) => Forward(ctx, f, MyDataClients.Provider, HttpMethod.Post, "SendPaymentsMethod"));
provider.MapPost("/CancelDeliveryNote", (HttpContext ctx, IHttpClientFactory f) => Forward(ctx, f, MyDataClients.Provider, HttpMethod.Post, "CancelDeliveryNote"));
provider.MapPost("/SendStatement", (HttpContext ctx, IHttpClientFactory f) => Forward(ctx, f, MyDataClients.Provider, HttpMethod.Post, "SendStatement"));
provider.MapPost("/RecallStatement", (HttpContext ctx, IHttpClientFactory f) => Forward(ctx, f, MyDataClients.Provider, HttpMethod.Post, "RecallStatement"));
provider.MapGet("/RequestStatements", (HttpContext ctx, IHttpClientFactory f) => Forward(ctx, f, MyDataClients.Provider, HttpMethod.Get, "RequestStatements"));

app.Run();

static async Task Forward(HttpContext ctx, IHttpClientFactory factory, string clientName, HttpMethod method, string path)
{
    var client = factory.CreateClient(clientName);
    var target = $"{path}{ctx.Request.QueryString.Value}";

    using var upstream = new HttpRequestMessage(method, target);

    if (method != HttpMethod.Get && method != HttpMethod.Head && ctx.Request.ContentLength is not 0)
    {
        var content = new StreamContent(ctx.Request.Body);
        if (!string.IsNullOrEmpty(ctx.Request.ContentType))
            content.Headers.TryAddWithoutValidation("Content-Type", ctx.Request.ContentType);
        upstream.Content = content;
    }

    if (ctx.Request.Headers.TryGetValue("aade-user-id", out var userId))
        upstream.Headers.TryAddWithoutValidation("aade-user-id", userId.ToArray());
    if (ctx.Request.Headers.TryGetValue("Ocp-Apim-Subscription-Key", out var subKey))
        upstream.Headers.TryAddWithoutValidation("Ocp-Apim-Subscription-Key", subKey.ToArray());

    using var response = await client.SendAsync(upstream, HttpCompletionOption.ResponseHeadersRead, ctx.RequestAborted);

    ctx.Response.StatusCode = (int) response.StatusCode;
    foreach (var header in response.Headers)
        ctx.Response.Headers[header.Key] = header.Value.ToArray();
    foreach (var header in response.Content.Headers)
        ctx.Response.Headers[header.Key] = header.Value.ToArray();
    ctx.Response.Headers.Remove("transfer-encoding");

    await response.Content.CopyToAsync(ctx.Response.Body, ctx.RequestAborted);
}

static class MyDataClients
{
    public const string Erp = "mydataErpClient";
    public const string Provider = "mydataProviderClient";
}
