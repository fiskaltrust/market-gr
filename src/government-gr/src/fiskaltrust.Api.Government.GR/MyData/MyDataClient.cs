using System.Net.Http.Headers;
using System.Text;
using Microsoft.Extensions.Options;

namespace fiskaltrust.Api.Government.GR.MyData;

public class MyDataClient : IMyDataClient
{
    private readonly HttpClient _httpClient;
    private readonly ILogger<MyDataClient> _logger;
    private readonly MyDataSettings _settings;

    public MyDataClient(HttpClient httpClient, ILogger<MyDataClient> logger, IOptions<AppSettings> options)
    {
        _httpClient = httpClient;
        _logger = logger;
        _settings = options.Value.MyData;
    }

    public async Task<HttpResponseMessage> SendInvoicesAsync(string xmlContent)
    {
        return await PostXmlAsync("SendInvoices", xmlContent);
    }

    public async Task<HttpResponseMessage> CancelInvoiceAsync(long mark)
    {
        return await PostXmlAsync($"CancelInvoice?mark={mark}", "");
    }

    public async Task<HttpResponseMessage> RequestDocsAsync(string queryString)
    {
        return await GetAsync($"RequestDocs{queryString}");
    }

    public async Task<HttpResponseMessage> RequestTransmittedDocsAsync(string queryString)
    {
        return await GetAsync($"RequestTransmittedDocs{queryString}");
    }

    public async Task<HttpResponseMessage> RequestMyIncomeAsync(string queryString)
    {
        return await GetAsync($"RequestMyIncome{queryString}");
    }

    public async Task<HttpResponseMessage> RequestMyExpensesAsync(string queryString)
    {
        return await GetAsync($"RequestMyExpenses{queryString}");
    }

    public async Task<HttpResponseMessage> SendIncomeClassificationAsync(string xmlContent)
    {
        return await PostXmlAsync("SendIncomeClassification", xmlContent);
    }

    public async Task<HttpResponseMessage> SendExpensesClassificationAsync(string xmlContent)
    {
        return await PostXmlAsync("SendExpensesClassification", xmlContent);
    }

    public async Task<HttpResponseMessage> SendPaymentMethodsAsync(string xmlContent)
    {
        return await PostXmlAsync("SendPaymentsMethod", xmlContent);
    }

    public async Task<HttpResponseMessage> RequestVatInfoAsync(string queryString)
    {
        return await GetAsync($"RequestVatInfo{queryString}");
    }

    public async Task<HttpResponseMessage> RequestE3InfoAsync(string queryString)
    {
        return await GetAsync($"RequestE3Info{queryString}");
    }

    public async Task<HttpResponseMessage> SendStatementAsync(string xmlContent)
    {
        return await PostXmlAsync("SendStatement", xmlContent);
    }

    public async Task<HttpResponseMessage> RequestStatementsAsync(string queryString)
    {
        return await GetAsync($"RequestStatements{queryString}");
    }

    private async Task<HttpResponseMessage> PostXmlAsync(string endpoint, string xmlContent)
    {
        var request = new HttpRequestMessage(HttpMethod.Post, endpoint);
        SetAadeHeaders(request);

        if (!string.IsNullOrEmpty(xmlContent))
        {
            request.Content = new StringContent(xmlContent, Encoding.UTF8, "application/xml");
        }

        _logger.LogInformation("Forwarding POST to myDATA: {Endpoint}", endpoint);
        return await _httpClient.SendAsync(request);
    }

    private async Task<HttpResponseMessage> GetAsync(string endpoint)
    {
        var request = new HttpRequestMessage(HttpMethod.Get, endpoint);
        SetAadeHeaders(request);

        _logger.LogInformation("Forwarding GET to myDATA: {Endpoint}", endpoint);
        return await _httpClient.SendAsync(request);
    }

    private void SetAadeHeaders(HttpRequestMessage request)
    {
        request.Headers.Accept.Add(new MediaTypeWithQualityHeaderValue("application/xml"));
        request.Headers.Add("aade-user-id", _settings.AadeUserId);
        request.Headers.Add("ocp-apim-subscription-key", _settings.SubscriptionKey);
    }
}
