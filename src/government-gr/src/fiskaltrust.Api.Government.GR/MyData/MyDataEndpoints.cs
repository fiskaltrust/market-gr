using System.IO;

namespace fiskaltrust.Api.Government.GR.MyData;

public static class MyDataEndpoints
{
    public static WebApplication MapMyDataEndpoints(this WebApplication app)
    {
        var group = app.MapGroup("/v0/mydata")
            .WithTags("myDATA Provider API")
            .RequireAuthorization("MyDataAccess");

        // POST endpoints
        group.MapPost("/SendInvoices", SendInvoices)
            .WithName("SendInvoices")
            .Produces(StatusCodes.Status200OK, contentType: "application/xml")
            .Produces(StatusCodes.Status400BadRequest)
            .Produces(StatusCodes.Status401Unauthorized);

        group.MapPost("/CancelInvoice", CancelInvoice)
            .WithName("CancelInvoice")
            .Produces(StatusCodes.Status200OK, contentType: "application/xml")
            .Produces(StatusCodes.Status400BadRequest)
            .Produces(StatusCodes.Status401Unauthorized);

        group.MapPost("/SendIncomeClassification", SendIncomeClassification)
            .WithName("SendIncomeClassification")
            .Produces(StatusCodes.Status200OK, contentType: "application/xml")
            .Produces(StatusCodes.Status400BadRequest)
            .Produces(StatusCodes.Status401Unauthorized);

        group.MapPost("/SendExpensesClassification", SendExpensesClassification)
            .WithName("SendExpensesClassification")
            .Produces(StatusCodes.Status200OK, contentType: "application/xml")
            .Produces(StatusCodes.Status400BadRequest)
            .Produces(StatusCodes.Status401Unauthorized);

        group.MapPost("/SendPaymentsMethod", SendPaymentsMethod)
            .WithName("SendPaymentsMethod")
            .Produces(StatusCodes.Status200OK, contentType: "application/xml")
            .Produces(StatusCodes.Status400BadRequest)
            .Produces(StatusCodes.Status401Unauthorized);

        group.MapPost("/SendStatement", SendStatement)
            .WithName("SendStatement")
            .Produces(StatusCodes.Status200OK, contentType: "application/xml")
            .Produces(StatusCodes.Status400BadRequest)
            .Produces(StatusCodes.Status401Unauthorized);

        // GET endpoints
        group.MapGet("/RequestDocs", RequestDocs)
            .WithName("RequestDocs")
            .Produces(StatusCodes.Status200OK, contentType: "application/xml")
            .Produces(StatusCodes.Status401Unauthorized);

        group.MapGet("/RequestTransmittedDocs", RequestTransmittedDocs)
            .WithName("RequestTransmittedDocs")
            .Produces(StatusCodes.Status200OK, contentType: "application/xml")
            .Produces(StatusCodes.Status401Unauthorized);

        group.MapGet("/RequestMyIncome", RequestMyIncome)
            .WithName("RequestMyIncome")
            .Produces(StatusCodes.Status200OK, contentType: "application/xml")
            .Produces(StatusCodes.Status401Unauthorized);

        group.MapGet("/RequestMyExpenses", RequestMyExpenses)
            .WithName("RequestMyExpenses")
            .Produces(StatusCodes.Status200OK, contentType: "application/xml")
            .Produces(StatusCodes.Status401Unauthorized);

        group.MapGet("/RequestVatInfo", RequestVatInfo)
            .WithName("RequestVatInfo")
            .Produces(StatusCodes.Status200OK, contentType: "application/xml")
            .Produces(StatusCodes.Status401Unauthorized);

        group.MapGet("/RequestE3Info", RequestE3Info)
            .WithName("RequestE3Info")
            .Produces(StatusCodes.Status200OK, contentType: "application/xml")
            .Produces(StatusCodes.Status401Unauthorized);

        group.MapGet("/RequestStatements", RequestStatements)
            .WithName("RequestStatements")
            .Produces(StatusCodes.Status200OK, contentType: "application/xml")
            .Produces(StatusCodes.Status401Unauthorized);

        return app;
    }

    private static async Task<string> ReadBodyAsync(HttpRequest request)
    {
        using var reader = new StreamReader(request.Body);
        return await reader.ReadToEndAsync();
    }

    private static async Task<IResult> ForwardResponseAsync(HttpResponseMessage response)
    {
        var content = await response.Content.ReadAsStringAsync();
        var contentType = response.Content.Headers.ContentType?.MediaType ?? "application/xml";
        return Results.Content(content, contentType, statusCode: (int)response.StatusCode);
    }

    private static async Task<IResult> SendInvoices(HttpContext ctx, IMyDataClient client)
    {
        var body = await ReadBodyAsync(ctx.Request);
        var response = await client.SendInvoicesAsync(body);
        return await ForwardResponseAsync(response);
    }

    private static async Task<IResult> CancelInvoice(HttpContext ctx, IMyDataClient client)
    {
        if (!long.TryParse(ctx.Request.Query["mark"], out var mark))
            return Results.BadRequest("Missing or invalid 'mark' query parameter");

        var response = await client.CancelInvoiceAsync(mark);
        return await ForwardResponseAsync(response);
    }

    private static async Task<IResult> SendIncomeClassification(HttpContext ctx, IMyDataClient client)
    {
        var body = await ReadBodyAsync(ctx.Request);
        var response = await client.SendIncomeClassificationAsync(body);
        return await ForwardResponseAsync(response);
    }

    private static async Task<IResult> SendExpensesClassification(HttpContext ctx, IMyDataClient client)
    {
        var body = await ReadBodyAsync(ctx.Request);
        var response = await client.SendExpensesClassificationAsync(body);
        return await ForwardResponseAsync(response);
    }

    private static async Task<IResult> SendPaymentsMethod(HttpContext ctx, IMyDataClient client)
    {
        var body = await ReadBodyAsync(ctx.Request);
        var response = await client.SendPaymentMethodsAsync(body);
        return await ForwardResponseAsync(response);
    }

    private static async Task<IResult> SendStatement(HttpContext ctx, IMyDataClient client)
    {
        var body = await ReadBodyAsync(ctx.Request);
        var response = await client.SendStatementAsync(body);
        return await ForwardResponseAsync(response);
    }

    private static async Task<IResult> RequestDocs(HttpContext ctx, IMyDataClient client)
    {
        var response = await client.RequestDocsAsync(ctx.Request.QueryString.Value ?? "");
        return await ForwardResponseAsync(response);
    }

    private static async Task<IResult> RequestTransmittedDocs(HttpContext ctx, IMyDataClient client)
    {
        var response = await client.RequestTransmittedDocsAsync(ctx.Request.QueryString.Value ?? "");
        return await ForwardResponseAsync(response);
    }

    private static async Task<IResult> RequestMyIncome(HttpContext ctx, IMyDataClient client)
    {
        var response = await client.RequestMyIncomeAsync(ctx.Request.QueryString.Value ?? "");
        return await ForwardResponseAsync(response);
    }

    private static async Task<IResult> RequestMyExpenses(HttpContext ctx, IMyDataClient client)
    {
        var response = await client.RequestMyExpensesAsync(ctx.Request.QueryString.Value ?? "");
        return await ForwardResponseAsync(response);
    }

    private static async Task<IResult> RequestVatInfo(HttpContext ctx, IMyDataClient client)
    {
        var response = await client.RequestVatInfoAsync(ctx.Request.QueryString.Value ?? "");
        return await ForwardResponseAsync(response);
    }

    private static async Task<IResult> RequestE3Info(HttpContext ctx, IMyDataClient client)
    {
        var response = await client.RequestE3InfoAsync(ctx.Request.QueryString.Value ?? "");
        return await ForwardResponseAsync(response);
    }

    private static async Task<IResult> RequestStatements(HttpContext ctx, IMyDataClient client)
    {
        var response = await client.RequestStatementsAsync(ctx.Request.QueryString.Value ?? "");
        return await ForwardResponseAsync(response);
    }
}
