namespace fiskaltrust.Api.Government.GR.MyData;

public interface IMyDataClient
{
    Task<HttpResponseMessage> SendInvoicesAsync(string xmlContent);
    Task<HttpResponseMessage> CancelInvoiceAsync(long mark);
    Task<HttpResponseMessage> RequestDocsAsync(string queryString);
    Task<HttpResponseMessage> RequestTransmittedDocsAsync(string queryString);
    Task<HttpResponseMessage> RequestMyIncomeAsync(string queryString);
    Task<HttpResponseMessage> RequestMyExpensesAsync(string queryString);
    Task<HttpResponseMessage> SendIncomeClassificationAsync(string xmlContent);
    Task<HttpResponseMessage> SendExpensesClassificationAsync(string xmlContent);
    Task<HttpResponseMessage> SendPaymentMethodsAsync(string xmlContent);
    Task<HttpResponseMessage> RequestVatInfoAsync(string queryString);
    Task<HttpResponseMessage> RequestE3InfoAsync(string queryString);
    Task<HttpResponseMessage> SendStatementAsync(string xmlContent);
    Task<HttpResponseMessage> RequestStatementsAsync(string queryString);
}
