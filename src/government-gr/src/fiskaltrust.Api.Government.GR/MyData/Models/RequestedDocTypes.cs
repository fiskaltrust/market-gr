using System.Xml.Serialization;

namespace fiskaltrust.Api.Government.GR.MyData.Models;

/// <summary>Root element for requested documents</summary>
[XmlRoot("RequestedDoc")]
public class RequestedDoc
{
    [XmlElement("continuationToken")]
    public ContinuationTokenType? ContinuationToken { get; set; }

    [XmlElement("invoicesDoc")]
    public List<AadeBookInvoiceType>? InvoicesDoc { get; set; }

    [XmlElement("cancelledInvoicesDoc")]
    public List<CancelledInvoiceType>? CancelledInvoicesDoc { get; set; }

    [XmlElement("incomeClassificationsDoc")]
    public List<InvoiceIncomeClassificationType>? IncomeClassificationsDoc { get; set; }

    [XmlElement("expensesClassificationsDoc")]
    public List<InvoiceExpensesClassificationType>? ExpensesClassificationsDoc { get; set; }

    [XmlElement("paymentMethodsDoc")]
    public List<PaymentMethodsPerInvoice>? PaymentMethodsDoc { get; set; }
}

/// <summary>Cancelled invoice type</summary>
public class CancelledInvoiceType
{
    [XmlElement("invoiceMark")]
    public long InvoiceMark { get; set; }

    [XmlElement("cancellationMark")]
    public long CancellationMark { get; set; }

    [XmlElement("cancellationDate")]
    public DateTime CancellationDate { get; set; }
}
