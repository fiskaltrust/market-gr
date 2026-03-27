using System.Net.Http.Headers;
using System.Text;

namespace fiskaltrust.Api.Government.GR.MyData;

public class MyDataClient : IMyDataClient
{
    private readonly HttpClient _httpClient;
    private readonly ILogger<MyDataClient> _logger;

    public MyDataClient(HttpClient httpClient, ILogger<MyDataClient> logger)
    {
        _httpClient = httpClient;
        _logger = logger;
    }

    public async Task<HttpResponseMessage> SendInvoicesAsync(string xmlContent, string aadeUserId, string subscriptionKey)
    {
        return await PostXmlAsync("SendInvoices", xmlContent, aadeUserId, subscriptionKey);
    }

    public async Task<HttpResponseMessage> CancelInvoiceAsync(long mark, string aadeUserId, string subscriptionKey)
    {
        return await PostXmlAsync($"CancelInvoice?mark={mark}", "", aadeUserId, subscriptionKey);
    }

    public async Task<HttpResponseMessage> RequestDocsAsync(string queryString, string aadeUserId, string subscriptionKey)
    {
        return await GetAsync($"RequestDocs{queryString}", aadeUserId, subscriptionKey);
    }

    public async Task<HttpResponseMessage> RequestTransmittedDocsAsync(string queryString, string aadeUserId, string subscriptionKey)
    {
        return await GetAsync($"RequestTransmittedDocs{queryString}", aadeUserId, subscriptionKey);
    }

    public async Task<HttpResponseMessage> RequestMyIncomeAsync(string queryString, string aadeUserId, string subscriptionKey)
    {
        return await GetAsync($"RequestMyIncome{queryString}", aadeUserId, subscriptionKey);
    }

    public async Task<HttpResponseMessage> RequestMyExpensesAsync(string queryString, string aadeUserId, string subscriptionKey)
    {
        return await GetAsync($"RequestMyExpenses{queryString}", aadeUserId, subscriptionKey);
    }

    public async Task<HttpResponseMessage> SendIncomeClassificationAsync(string xmlContent, string aadeUserId, string subscriptionKey)
    {
        return await PostXmlAsync("SendIncomeClassification", xmlContent, aadeUserId, subscriptionKey);
    }

    public async Task<HttpResponseMessage> SendExpensesClassificationAsync(string xmlContent, string aadeUserId, string subscriptionKey)
    {
        return await PostXmlAsync("SendExpensesClassification", xmlContent, aadeUserId, subscriptionKey);
    }

    public async Task<HttpResponseMessage> SendPaymentMethodsAsync(string xmlContent, string aadeUserId, string subscriptionKey)
    {
        return await PostXmlAsync("SendPaymentsMethod", xmlContent, aadeUserId, subscriptionKey);
    }

    public async Task<HttpResponseMessage> RequestVatInfoAsync(string queryString, string aadeUserId, string subscriptionKey)
    {
        return await GetAsync($"RequestVatInfo{queryString}", aadeUserId, subscriptionKey);
    }

    public async Task<HttpResponseMessage> RequestE3InfoAsync(string queryString, string aadeUserId, string subscriptionKey)
    {
        return await GetAsync($"RequestE3Info{queryString}", aadeUserId, subscriptionKey);
    }

    public async Task<HttpResponseMessage> SendStatementAsync(string xmlContent, string aadeUserId, string subscriptionKey)
    {
        return await PostXmlAsync("SendStatement", xmlContent, aadeUserId, subscriptionKey);
    }

    public async Task<HttpResponseMessage> RequestStatementsAsync(string queryString, string aadeUserId, string subscriptionKey)
    {
        return await GetAsync($"RequestStatements{queryString}", aadeUserId, subscriptionKey);
    }

    private async Task<HttpResponseMessage> PostXmlAsync(string endpoint, string xmlContent, string aadeUserId, string subscriptionKey)
    {
        var request = new HttpRequestMessage(HttpMethod.Post, endpoint);
        SetAadeHeaders(request, aadeUserId, subscriptionKey);

        if (!string.IsNullOrEmpty(xmlContent))
        {
            request.Content = new StringContent(xmlContent, Encoding.UTF8, "application/xml");
        }

        _logger.LogInformation("Forwarding POST to myDATA: {Endpoint}", endpoint);
        return await _httpClient.SendAsync(request);
    }

    private async Task<HttpResponseMessage> GetAsync(string endpoint, string aadeUserId, string subscriptionKey)
    {
        var request = new HttpRequestMessage(HttpMethod.Get, endpoint);
        SetAadeHeaders(request, aadeUserId, subscriptionKey);

        _logger.LogInformation("Forwarding GET to myDATA: {Endpoint}", endpoint);
        return await _httpClient.SendAsync(request);
    }

    private static void SetAadeHeaders(HttpRequestMessage request, string aadeUserId, string subscriptionKey)
    {
        request.Headers.Accept.Add(new MediaTypeWithQualityHeaderValue("application/xml"));
        request.Headers.Add("aade-user-id", aadeUserId);
        request.Headers.Add("ocp-apim-subscription-key", subscriptionKey);
    }
}
