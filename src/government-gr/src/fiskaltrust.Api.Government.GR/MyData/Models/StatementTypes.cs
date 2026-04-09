using System.Xml.Serialization;

namespace fiskaltrust.Api.Government.GR.MyData.Models;

/// <summary>Root element for statement submission</summary>
[XmlRoot("StatementDoc")]
public class StatementDoc
{
    [XmlElement("statement")]
    public Statement Statement { get; set; } = new();
}

/// <summary>Provider statement</summary>
public class Statement
{
    [XmlElement("statementId")]
    public long? StatementId { get; set; }

    [XmlElement("submissionDateTime")]
    public DateTime? SubmissionDateTime { get; set; }

    [XmlElement("entityVatNumber")]
    public string EntityVatNumber { get; set; } = "";

    [XmlElement("liableUserCategory")]
    public LiableUserCategoryType LiableUserCategory { get; set; }

    [XmlElement("providerType")]
    public ProviderTypeEnum ProviderType { get; set; }

    [XmlElement("isB2BTransactions")]
    public bool? IsB2BTransactions { get; set; }

    [XmlElement("isB2CTransactions")]
    public bool? IsB2CTransactions { get; set; }

    [XmlElement("isB2GTransactions")]
    public bool? IsB2GTransactions { get; set; }

    [XmlElement("providerVatNumber")]
    public string ProviderVatNumber { get; set; } = "";

    [XmlElement("providerLicenceNumber")]
    public string ProviderLicenceNumber { get; set; } = "";

    [XmlElement("providerContractNumber")]
    public string ProviderContractNumber { get; set; } = "";

    [XmlElement("providerContractConclusionDate")]
    public DateTime ProviderContractConclusionDate { get; set; }

    [XmlElement("providerContractActivationDate")]
    public DateTime ProviderContractActivationDate { get; set; }

    [XmlElement("issueStartDate")]
    public DateTime? IssueStartDate { get; set; }

    [XmlElement("issueStopDate")]
    public DateTime? IssueStopDate { get; set; }

    [XmlElement("internetProvider")]
    public string? InternetProvider { get; set; }

    [XmlElement("internetProviderContractNumber")]
    public string? InternetProviderContractNumber { get; set; }

    [XmlElement("internetProviderContractDate")]
    public DateTime? InternetProviderContractDate { get; set; }
}

/// <summary>Root element for requested statement documents</summary>
[XmlRoot("RequestedStatementDoc")]
public class RequestedStatementDoc
{
    [XmlElement("requestedStatement")]
    public List<RequestedStatement> RequestedStatements { get; set; } = [];
}

/// <summary>Requested statement</summary>
public class RequestedStatement
{
    [XmlElement("statement")]
    public Statement? Statement { get; set; }

    [XmlElement("acceptVatNumber")]
    public string? AcceptVatNumber { get; set; }

    [XmlElement("acceptDate")]
    public DateTime? AcceptDate { get; set; }

    [XmlElement("recallStatement")]
    public RecalledStatementType? RecallStatement { get; set; }
}

/// <summary>Recalled statement type</summary>
public class RecalledStatementType
{
    [XmlElement("statementID")]
    public long StatementID { get; set; }

    [XmlElement("entityVatNumber")]
    public string? EntityVatNumber { get; set; }

    [XmlElement("recallId")]
    public long? RecallId { get; set; }

    [XmlElement("recallStatus")]
    public RecallStatusType? RecallStatus { get; set; }

    [XmlElement("recallDate")]
    public DateTime? RecallDate { get; set; }

    [XmlElement("transactionDate")]
    public DateTime? TransactionDate { get; set; }

    [XmlElement("recallVatNumber")]
    public string? RecallVatNumber { get; set; }
}
