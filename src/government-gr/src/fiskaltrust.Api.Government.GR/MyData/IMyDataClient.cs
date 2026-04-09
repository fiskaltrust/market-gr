namespace fiskaltrust.Api.Government.GR.MyData;

public interface IMyDataClient
{
    Task<HttpResponseMessage> SendInvoicesAsync(string xmlContent, string aadeUserId, string subscriptionKey);
    Task<HttpResponseMessage> CancelInvoiceAsync(long mark, string aadeUserId, string subscriptionKey);
    Task<HttpResponseMessage> RequestDocsAsync(string queryString, string aadeUserId, string subscriptionKey);
    Task<HttpResponseMessage> RequestTransmittedDocsAsync(string queryString, string aadeUserId, string subscriptionKey);
    Task<HttpResponseMessage> RequestMyIncomeAsync(string queryString, string aadeUserId, string subscriptionKey);
    Task<HttpResponseMessage> RequestMyExpensesAsync(string queryString, string aadeUserId, string subscriptionKey);
    Task<HttpResponseMessage> SendIncomeClassificationAsync(string xmlContent, string aadeUserId, string subscriptionKey);
    Task<HttpResponseMessage> SendExpensesClassificationAsync(string xmlContent, string aadeUserId, string subscriptionKey);
    Task<HttpResponseMessage> SendPaymentMethodsAsync(string xmlContent, string aadeUserId, string subscriptionKey);
    Task<HttpResponseMessage> RequestVatInfoAsync(string queryString, string aadeUserId, string subscriptionKey);
    Task<HttpResponseMessage> RequestE3InfoAsync(string queryString, string aadeUserId, string subscriptionKey);
    Task<HttpResponseMessage> SendStatementAsync(string xmlContent, string aadeUserId, string subscriptionKey);
    Task<HttpResponseMessage> RequestStatementsAsync(string queryString, string aadeUserId, string subscriptionKey);
}
