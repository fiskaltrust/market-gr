using System.Xml.Serialization;

namespace fiskaltrust.Api.Government.GR.MyData.Models;

/// <summary>Root element for income classification submissions</summary>
[XmlRoot("IncomeClassificationsDoc", Namespace = "https://www.aade.gr/myDATA/incomeClassificaton/v1.0")]
public class IncomeClassificationsDoc
{
    [XmlElement("incomeInvoiceClassification")]
    public List<InvoiceIncomeClassificationType> InvoiceIncomeClassifications { get; set; } = [];
}

/// <summary>Invoice income classification type</summary>
public class InvoiceIncomeClassificationType
{
    [XmlElement("invoiceMark")]
    public long InvoiceMark { get; set; }

    [XmlElement("classificationMark")]
    public long? ClassificationMark { get; set; }

    [XmlElement("entityVatNumber")]
    public string? EntityVatNumber { get; set; }

    [XmlElement("transactionMode")]
    public TransactionModeType? TransactionMode { get; set; }

    [XmlElement("invoicesIncomeClassificationDetails")]
    public List<InvoicesIncomeClassificationDetailType>? InvoicesIncomeClassificationDetails { get; set; }
}

/// <summary>Income classification detail per line</summary>
public class InvoicesIncomeClassificationDetailType
{
    [XmlElement("lineNumber")]
    public int LineNumber { get; set; }

    [XmlElement("incomeClassificationDetailData")]
    public List<IncomeClassificationType> IncomeClassificationDetailData { get; set; } = [];
}

/// <summary>Root element for expenses classification submissions</summary>
[XmlRoot("ExpensesClassificationsDoc", Namespace = "https://www.aade.gr/myDATA/expensesClassificaton/v1.0")]
public class ExpensesClassificationsDoc
{
    [XmlElement("expensesInvoiceClassification")]
    public List<InvoiceExpensesClassificationType> InvoiceExpensesClassifications { get; set; } = [];
}

/// <summary>Invoice expenses classification type</summary>
public class InvoiceExpensesClassificationType
{
    [XmlElement("invoiceMark")]
    public long InvoiceMark { get; set; }

    [XmlElement("classificationMark")]
    public long? ClassificationMark { get; set; }

    [XmlElement("entityVatNumber")]
    public string? EntityVatNumber { get; set; }

    [XmlElement("transactionMode")]
    public TransactionModeType? TransactionMode { get; set; }

    [XmlElement("invoicesExpensesClassificationDetails")]
    public List<InvoicesExpensesClassificationDetailType>? InvoicesExpensesClassificationDetails { get; set; }

    [XmlElement("classificationPostMode")]
    public ClassificationPostModeType? ClassificationPostMode { get; set; }
}

/// <summary>Expenses classification detail per line</summary>
public class InvoicesExpensesClassificationDetailType
{
    [XmlElement("lineNumber")]
    public int LineNumber { get; set; }

    [XmlElement("expensesClassificationDetailData")]
    public List<ExpensesClassificationType> ExpensesClassificationDetailData { get; set; } = [];
}
