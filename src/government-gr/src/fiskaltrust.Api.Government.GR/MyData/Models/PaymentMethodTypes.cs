using System.Xml.Serialization;

namespace fiskaltrust.Api.Government.GR.MyData.Models;

/// <summary>Root element for payment method submissions</summary>
[XmlRoot("PaymentMethodsDoc", Namespace = "https://www.aade.gr/myDATA/paymentMethod/v1.0")]
public class PaymentMethodsDoc
{
    [XmlElement("paymentMethods")]
    public List<PaymentMethodsPerInvoice> PaymentMethods { get; set; } = [];
}

/// <summary>Payment methods for a single invoice</summary>
public class PaymentMethodsPerInvoice
{
    [XmlElement("invoiceMark")]
    public long InvoiceMark { get; set; }

    [XmlElement("paymentMethodMark")]
    public long? PaymentMethodMark { get; set; }

    [XmlElement("entityVatNumber")]
    public string? EntityVatNumber { get; set; }

    [XmlElement("paymentMethodDetails")]
    public List<PaymentMethodDetailType> PaymentMethodDetails { get; set; } = [];
}
