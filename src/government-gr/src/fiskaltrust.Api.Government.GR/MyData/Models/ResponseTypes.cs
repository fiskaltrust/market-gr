using System.Xml.Serialization;

namespace fiskaltrust.Api.Government.GR.MyData.Models;

/// <summary>Root element for API responses</summary>
[XmlRoot("ResponseDoc")]
public class ResponseDoc
{
    [XmlElement("response")]
    public List<ResponseType> Responses { get; set; } = [];
}

/// <summary>Individual response type</summary>
public class ResponseType
{
    [XmlElement("index")]
    public int? Index { get; set; }

    [XmlElement("invoiceUid")]
    public string? InvoiceUid { get; set; }

    [XmlElement("invoiceMark")]
    public long? InvoiceMark { get; set; }

    [XmlElement("qrUrl")]
    public string? QrUrl { get; set; }

    [XmlElement("classificationMark")]
    public long? ClassificationMark { get; set; }

    [XmlElement("cancellationMark")]
    public long? CancellationMark { get; set; }

    [XmlElement("paymentMethodMark")]
    public long? PaymentMethodMark { get; set; }

    [XmlElement("authenticationCode")]
    public string? AuthenticationCode { get; set; }

    [XmlElement("receptionProviders")]
    public ReceptionProvidersType? ReceptionProviders { get; set; }

    [XmlElement("receptionEmails")]
    public ReceptionEmailsType? ReceptionEmails { get; set; }

    [XmlElement("errors")]
    public ErrorsType? Errors { get; set; }

    [XmlElement("statusCode")]
    public string StatusCode { get; set; } = "";
}

/// <summary>Error container</summary>
public class ErrorsType
{
    [XmlElement("error")]
    public List<ErrorType> ErrorList { get; set; } = [];
}

/// <summary>Error type</summary>
public class ErrorType
{
    [XmlElement("message")]
    public string? Message { get; set; }

    [XmlElement("code")]
    public string? Code { get; set; }
}

/// <summary>Reception providers type</summary>
public class ReceptionProvidersType
{
    [XmlElement("ProviderInfo")]
    public List<ProviderInfoType> ProviderInfo { get; set; } = [];
}

/// <summary>Provider info type</summary>
public class ProviderInfoType
{
    [XmlElement("VATNumber")]
    public List<string> VATNumbers { get; set; } = [];
}

/// <summary>Reception emails type</summary>
public class ReceptionEmailsType
{
    [XmlElement("email")]
    public List<string> Emails { get; set; } = [];
}
