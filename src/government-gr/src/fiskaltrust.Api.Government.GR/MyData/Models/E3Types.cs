using System.Xml.Serialization;

namespace fiskaltrust.Api.Government.GR.MyData.Models;

/// <summary>Root element for E3 info response</summary>
[XmlRoot("RequestedE3Info")]
public class RequestedE3Info
{
    [XmlElement("continuationToken")]
    public ContinuationTokenType? ContinuationToken { get; set; }

    [XmlElement("E3Info")]
    public List<InvoiceE3DetailType> E3Info { get; set; } = [];
}

/// <summary>E3 classification detail type</summary>
public class InvoiceE3DetailType
{
    [XmlElement("V_Afm")]
    public string? VAfm { get; set; }

    [XmlElement("V_Mark")]
    public string? VMark { get; set; }

    [XmlElement("vBook")]
    public string? VBook { get; set; }

    [XmlElement("IsCancelled")]
    public bool? IsCancelled { get; set; }

    [XmlElement("IssueDate")]
    public DateTime IssueDate { get; set; }

    [XmlElement("V_Class_Category")]
    public string? VClassCategory { get; set; }

    [XmlElement("V_Class_Type")]
    public string? VClassType { get; set; }

    [XmlElement("V_Class_Value")]
    public decimal? VClassValue { get; set; }
}
