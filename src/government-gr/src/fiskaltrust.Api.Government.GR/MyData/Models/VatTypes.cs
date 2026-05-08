using System.Xml.Serialization;

namespace fiskaltrust.Api.Government.GR.MyData.Models;

/// <summary>Root element for VAT info response</summary>
[XmlRoot("RequestedVatInfo")]
public class RequestedVatInfo
{
    [XmlElement("continuationToken")]
    public ContinuationTokenType? ContinuationToken { get; set; }

    [XmlElement("VatInfo")]
    public List<InvoiceVatDetailType> VatInfo { get; set; } = [];
}

/// <summary>VAT detail type</summary>
public class InvoiceVatDetailType
{
    [XmlElement("Mark")]
    public string? Mark { get; set; }

    [XmlElement("IsCancelled")]
    public bool? IsCancelled { get; set; }

    [XmlElement("IssueDate")]
    public DateTime IssueDate { get; set; }

    [XmlElement("Vat301")]
    public decimal? Vat301 { get; set; }

    [XmlElement("Vat302")]
    public decimal? Vat302 { get; set; }

    [XmlElement("Vat303")]
    public decimal? Vat303 { get; set; }

    [XmlElement("Vat304")]
    public decimal? Vat304 { get; set; }

    [XmlElement("Vat305")]
    public decimal? Vat305 { get; set; }

    [XmlElement("Vat306")]
    public decimal? Vat306 { get; set; }

    [XmlElement("Vat331")]
    public decimal? Vat331 { get; set; }

    [XmlElement("Vat332")]
    public decimal? Vat332 { get; set; }

    [XmlElement("Vat333")]
    public decimal? Vat333 { get; set; }

    [XmlElement("Vat334")]
    public decimal? Vat334 { get; set; }

    [XmlElement("Vat335")]
    public decimal? Vat335 { get; set; }

    [XmlElement("Vat336")]
    public decimal? Vat336 { get; set; }

    [XmlElement("Vat361")]
    public decimal? Vat361 { get; set; }

    [XmlElement("Vat362")]
    public decimal? Vat362 { get; set; }

    [XmlElement("Vat363")]
    public decimal? Vat363 { get; set; }

    [XmlElement("Vat364")]
    public decimal? Vat364 { get; set; }

    [XmlElement("Vat365")]
    public decimal? Vat365 { get; set; }

    [XmlElement("Vat366")]
    public decimal? Vat366 { get; set; }

    [XmlElement("Vat381")]
    public decimal? Vat381 { get; set; }

    [XmlElement("Vat382")]
    public decimal? Vat382 { get; set; }

    [XmlElement("Vat383")]
    public decimal? Vat383 { get; set; }

    [XmlElement("Vat384")]
    public decimal? Vat384 { get; set; }

    [XmlElement("Vat385")]
    public decimal? Vat385 { get; set; }

    [XmlElement("Vat386")]
    public decimal? Vat386 { get; set; }

    [XmlElement("Vat342")]
    public decimal? Vat342 { get; set; }

    [XmlElement("Vat345")]
    public decimal? Vat345 { get; set; }

    [XmlElement("Vat348")]
    public decimal? Vat348 { get; set; }

    [XmlElement("Vat349")]
    public decimal? Vat349 { get; set; }

    [XmlElement("Vat310")]
    public decimal? Vat310 { get; set; }

    [XmlElement("Vat402")]
    public decimal? Vat402 { get; set; }

    [XmlElement("Vat407")]
    public decimal? Vat407 { get; set; }

    [XmlElement("Vat411")]
    public decimal? Vat411 { get; set; }

    [XmlElement("Vat423")]
    public decimal? Vat423 { get; set; }

    [XmlElement("Vat422")]
    public decimal? Vat422 { get; set; }

    [XmlElement("VatUnclassified361")]
    public decimal? VatUnclassified361 { get; set; }

    [XmlElement("VatUnclassified381")]
    public decimal? VatUnclassified381 { get; set; }
}
