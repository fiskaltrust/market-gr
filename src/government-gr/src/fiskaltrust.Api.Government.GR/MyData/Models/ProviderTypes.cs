using System.Xml.Serialization;

namespace fiskaltrust.Api.Government.GR.MyData.Models;

/// <summary>Root element for requested provider documents</summary>
[XmlRoot("RequestedProviderDoc")]
public class RequestedProviderDoc
{
    [XmlElement("continuationToken")]
    public ContinuationTokenType? ContinuationToken { get; set; }

    [XmlElement("InvoiceProviderType")]
    public List<InvoiceProviderType> InvoiceProviders { get; set; } = [];
}

/// <summary>Continuation token for pagination</summary>
public class ContinuationTokenType
{
    [XmlElement("nextPartitionKey")]
    public string? NextPartitionKey { get; set; }

    [XmlElement("nextRowKey")]
    public string? NextRowKey { get; set; }
}

/// <summary>Invoice provider type</summary>
public class InvoiceProviderType
{
    [XmlElement("issuerVAT")]
    public string? IssuerVAT { get; set; }

    [XmlElement("invoiceProviderMark")]
    public long? InvoiceProviderMark { get; set; }

    [XmlElement("invoiceUid")]
    public string? InvoiceUid { get; set; }

    [XmlElement("authenticationCode")]
    public string? AuthenticationCode { get; set; }
}
