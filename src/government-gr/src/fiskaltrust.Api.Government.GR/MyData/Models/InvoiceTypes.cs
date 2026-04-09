using System.Xml.Serialization;

namespace fiskaltrust.Api.Government.GR.MyData.Models;

/// <summary>Root element for invoice submissions</summary>
[XmlRoot("InvoicesDoc", Namespace = "http://www.aade.gr/myDATA/invoice/v1.0")]
public class InvoicesDoc
{
    [XmlElement("invoice")]
    public List<AadeBookInvoiceType> Invoices { get; set; } = [];
}

/// <summary>Main invoice type</summary>
public class AadeBookInvoiceType
{
    [XmlElement("uid")]
    public string? Uid { get; set; }

    [XmlElement("mark")]
    public long? Mark { get; set; }

    [XmlElement("cancelledByMark")]
    public long? CancelledByMark { get; set; }

    [XmlElement("authenticationCode")]
    public string? AuthenticationCode { get; set; }

    [XmlElement("transmissionFailure")]
    public TransmissionFailureType? TransmissionFailure { get; set; }

    [XmlElement("issuer")]
    public PartyType? Issuer { get; set; }

    [XmlElement("counterpart")]
    public PartyType? Counterpart { get; set; }

    [XmlElement("invoiceHeader")]
    public InvoiceHeaderType? InvoiceHeader { get; set; }

    [XmlElement("paymentMethods")]
    public PaymentMethodsInfo? PaymentMethods { get; set; }

    [XmlElement("invoiceDetails")]
    public List<InvoiceRowType> InvoiceDetails { get; set; } = [];

    [XmlElement("taxesTotals")]
    public TaxTotalsInfo? TaxesTotals { get; set; }

    [XmlElement("invoiceSummary")]
    public InvoiceSummaryType? InvoiceSummary { get; set; }

    [XmlElement("qrCodeUrl")]
    public string? QrCodeUrl { get; set; }

    [XmlElement("otherTransportDetails")]
    public List<TransportDetailType>? OtherTransportDetails { get; set; }

    [XmlElement("downloadingInvoiceUrl")]
    public string? DownloadingInvoiceUrl { get; set; }
}

public class PaymentMethodsInfo
{
    [XmlElement("paymentMethodDetails")]
    public List<PaymentMethodDetailType> PaymentMethodDetails { get; set; } = [];
}

public class TaxTotalsInfo
{
    [XmlElement("taxes")]
    public List<TaxTotalsType> Taxes { get; set; } = [];
}

/// <summary>Party (issuer/counterpart) type</summary>
public class PartyType
{
    [XmlElement("vatNumber")]
    public string VatNumber { get; set; } = "";

    [XmlElement("country")]
    public string Country { get; set; } = "";

    [XmlElement("branch")]
    public int Branch { get; set; }

    [XmlElement("name")]
    public string? Name { get; set; }

    [XmlElement("address")]
    public AddressType? Address { get; set; }

    [XmlElement("documentIdNo")]
    public string? DocumentIdNo { get; set; }

    [XmlElement("supplyAccountNo")]
    public string? SupplyAccountNo { get; set; }

    [XmlElement("countryDocumentId")]
    public string? CountryDocumentId { get; set; }
}

/// <summary>Address type</summary>
public class AddressType
{
    [XmlElement("street")]
    public string? Street { get; set; }

    [XmlElement("number")]
    public string? Number { get; set; }

    [XmlElement("postalCode")]
    public string PostalCode { get; set; } = "";

    [XmlElement("city")]
    public string City { get; set; } = "";
}

/// <summary>Invoice header type</summary>
public class InvoiceHeaderType
{
    [XmlElement("series")]
    public string? Series { get; set; }

    [XmlElement("aa")]
    public string? Aa { get; set; }

    [XmlElement("issueDate")]
    public DateTime IssueDate { get; set; }

    [XmlElement("invoiceType")]
    public InvoiceType InvoiceType { get; set; }

    [XmlElement("vatPaymentSuspension")]
    public bool? VatPaymentSuspension { get; set; }

    [XmlElement("currency")]
    public string? Currency { get; set; }

    [XmlElement("exchangeRate")]
    public decimal? ExchangeRate { get; set; }

    [XmlElement("correlatedInvoices")]
    public List<long>? CorrelatedInvoices { get; set; }

    [XmlElement("selfPricing")]
    public bool? SelfPricing { get; set; }

    [XmlElement("dispatchDate")]
    public DateTime? DispatchDate { get; set; }

    [XmlElement("dispatchTime")]
    public string? DispatchTime { get; set; }

    [XmlElement("vehicleNumber")]
    public string? VehicleNumber { get; set; }

    [XmlElement("movePurpose")]
    public MovePurposeType? MovePurpose { get; set; }

    [XmlElement("fuelInvoice")]
    public bool? FuelInvoice { get; set; }

    [XmlElement("specialInvoiceCategory")]
    public SpecialInvoiceCategoryType? SpecialInvoiceCategory { get; set; }

    [XmlElement("invoiceVariationType")]
    public InvoiceVariationType? InvoiceVariationType { get; set; }

    [XmlElement("otherCorrelatedEntities")]
    public List<EntityType>? OtherCorrelatedEntities { get; set; }

    [XmlElement("otherDeliveryNoteHeader")]
    public OtherDeliveryNoteHeaderType? OtherDeliveryNoteHeader { get; set; }

    [XmlElement("isDeliveryNote")]
    public bool? IsDeliveryNote { get; set; }

    [XmlElement("otherMovePurposeTitle")]
    public string? OtherMovePurposeTitle { get; set; }

    [XmlElement("thirdPartyCollection")]
    public bool? ThirdPartyCollection { get; set; }

    [XmlElement("multipleConnectedMarks")]
    public List<long>? MultipleConnectedMarks { get; set; }

    [XmlElement("tableAA")]
    public string? TableAA { get; set; }

    [XmlElement("totalCancelDeliveryOrders")]
    public bool? TotalCancelDeliveryOrders { get; set; }

    [XmlElement("reverseDeliveryNote")]
    public bool? ReverseDeliveryNote { get; set; }

    [XmlElement("reverseDeliveryNotePurpose")]
    public ReverseDeliveryNotePurposeType? ReverseDeliveryNotePurpose { get; set; }
}

/// <summary>Invoice line item type</summary>
public class InvoiceRowType
{
    [XmlElement("lineNumber")]
    public int LineNumber { get; set; }

    [XmlElement("recType")]
    public RecType? RecType { get; set; }

    [XmlElement("TaricNo")]
    public string? TaricNo { get; set; }

    [XmlElement("itemCode")]
    public string? ItemCode { get; set; }

    [XmlElement("itemDescr")]
    public string? ItemDescr { get; set; }

    [XmlElement("fuelCode")]
    public FuelCodes? FuelCode { get; set; }

    [XmlElement("quantity")]
    public decimal? Quantity { get; set; }

    [XmlElement("measurementUnit")]
    public QuantityType? MeasurementUnit { get; set; }

    [XmlElement("invoiceDetailType")]
    public InvoiceDetailType? InvoiceDetailType { get; set; }

    [XmlElement("netValue")]
    public decimal NetValue { get; set; }

    [XmlElement("vatCategory")]
    public VatType VatCategory { get; set; }

    [XmlElement("vatAmount")]
    public decimal VatAmount { get; set; }

    [XmlElement("vatExemptionCategory")]
    public VatExemptionType? VatExemptionCategory { get; set; }

    [XmlElement("dienergia")]
    public ShipType? Dienergia { get; set; }

    [XmlElement("discountOption")]
    public bool? DiscountOption { get; set; }

    [XmlElement("withheldAmount")]
    public decimal? WithheldAmount { get; set; }

    [XmlElement("withheldPercentCategory")]
    public WithheldType? WithheldPercentCategory { get; set; }

    [XmlElement("stampDutyAmount")]
    public decimal? StampDutyAmount { get; set; }

    [XmlElement("stampDutyPercentCategory")]
    public StampDutyType? StampDutyPercentCategory { get; set; }

    [XmlElement("feesAmount")]
    public decimal? FeesAmount { get; set; }

    [XmlElement("feesPercentCategory")]
    public FeesType? FeesPercentCategory { get; set; }

    [XmlElement("otherTaxesPercentCategory")]
    public OtherTaxesType? OtherTaxesPercentCategory { get; set; }

    [XmlElement("otherTaxesAmount")]
    public decimal? OtherTaxesAmount { get; set; }

    [XmlElement("deductionsAmount")]
    public decimal? DeductionsAmount { get; set; }

    [XmlElement("lineComments")]
    public string? LineComments { get; set; }

    [XmlElement("incomeClassification")]
    public List<IncomeClassificationType>? IncomeClassification { get; set; }

    [XmlElement("expensesClassification")]
    public List<ExpensesClassificationType>? ExpensesClassification { get; set; }

    [XmlElement("quantity15")]
    public decimal? Quantity15 { get; set; }

    [XmlElement("otherMeasurementUnitQuantity")]
    public int? OtherMeasurementUnitQuantity { get; set; }

    [XmlElement("otherMeasurementUnitTitle")]
    public string? OtherMeasurementUnitTitle { get; set; }

    [XmlElement("notVAT195")]
    public bool? NotVAT195 { get; set; }
}

/// <summary>Invoice summary type</summary>
public class InvoiceSummaryType
{
    [XmlElement("totalNetValue")]
    public decimal TotalNetValue { get; set; }

    [XmlElement("totalVatAmount")]
    public decimal TotalVatAmount { get; set; }

    [XmlElement("totalWithheldAmount")]
    public decimal? TotalWithheldAmount { get; set; }

    [XmlElement("totalFeesAmount")]
    public decimal? TotalFeesAmount { get; set; }

    [XmlElement("totalStampDutyAmount")]
    public decimal? TotalStampDutyAmount { get; set; }

    [XmlElement("totalOtherTaxesAmount")]
    public decimal? TotalOtherTaxesAmount { get; set; }

    [XmlElement("totalDeductionsAmount")]
    public decimal? TotalDeductionsAmount { get; set; }

    [XmlElement("totalGrossValue")]
    public decimal TotalGrossValue { get; set; }

    [XmlElement("incomeClassification")]
    public List<IncomeClassificationType>? IncomeClassification { get; set; }

    [XmlElement("expensesClassification")]
    public List<ExpensesClassificationType>? ExpensesClassification { get; set; }
}

/// <summary>Payment method detail type</summary>
public class PaymentMethodDetailType
{
    [XmlElement("type")]
    public PaymentMethodType Type { get; set; }

    [XmlElement("amount")]
    public decimal Amount { get; set; }

    [XmlElement("paymentMethodInfo")]
    public string? PaymentMethodInfo { get; set; }

    [XmlElement("tipAmount")]
    public decimal? TipAmount { get; set; }

    [XmlElement("transactionId")]
    public string? TransactionId { get; set; }

    [XmlElement("tid")]
    public string? Tid { get; set; }

    [XmlElement("ProvidersSignature")]
    public ProviderSignatureType? ProvidersSignature { get; set; }

    [XmlElement("ECRToken")]
    public ECRTokenType? ECRToken { get; set; }
}

/// <summary>Provider signature type</summary>
public class ProviderSignatureType
{
    [XmlElement("SigningAuthor")]
    public string? SigningAuthor { get; set; }

    [XmlElement("Signature")]
    public string? Signature { get; set; }
}

/// <summary>ECR token type</summary>
public class ECRTokenType
{
    [XmlElement("SigningAuthor")]
    public string? SigningAuthor { get; set; }

    [XmlElement("SessionNumber")]
    public string? SessionNumber { get; set; }
}

/// <summary>Tax totals type</summary>
public class TaxTotalsType
{
    [XmlElement("taxType")]
    public TaxType TaxType { get; set; }

    [XmlElement("taxCategory")]
    public int? TaxCategory { get; set; }

    [XmlElement("underlyingValue")]
    public decimal? UnderlyingValue { get; set; }

    [XmlElement("taxAmount")]
    public decimal TaxAmount { get; set; }

    [XmlElement("id")]
    public byte? Id { get; set; }
}

/// <summary>Entity type (related entities)</summary>
public class EntityType
{
    [XmlElement("type")]
    public EntityCategoryType Type { get; set; }

    [XmlElement("entityData")]
    public PartyType? EntityData { get; set; }
}

/// <summary>Transport detail type</summary>
public class TransportDetailType
{
    [XmlElement("vehicleNumber")]
    public string? VehicleNumber { get; set; }
}

/// <summary>Other delivery note header type</summary>
public class OtherDeliveryNoteHeaderType
{
    [XmlElement("loadingAddress")]
    public AddressType LoadingAddress { get; set; } = new();

    [XmlElement("deliveryAddress")]
    public AddressType DeliveryAddress { get; set; } = new();

    [XmlElement("startShippingBranch")]
    public int? StartShippingBranch { get; set; }

    [XmlElement("completeShippingBranch")]
    public int? CompleteShippingBranch { get; set; }
}

/// <summary>Ship type (Dienergia - POL 1177/2018)</summary>
public class ShipType
{
    [XmlElement("applicationId")]
    public string? ApplicationId { get; set; }

    [XmlElement("applicationDate")]
    public DateTime? ApplicationDate { get; set; }

    [XmlElement("doy")]
    public string? Doy { get; set; }

    [XmlElement("shipId")]
    public string? ShipId { get; set; }
}

/// <summary>Income classification type</summary>
public class IncomeClassificationType
{
    [XmlElement("classificationType")]
    public IncomeClassificationValueType? ClassificationType { get; set; }

    [XmlElement("classificationCategory")]
    public IncomeClassificationCategoryType ClassificationCategory { get; set; }

    [XmlElement("amount")]
    public decimal Amount { get; set; }

    [XmlElement("id")]
    public byte? Id { get; set; }
}

/// <summary>Expenses classification type</summary>
public class ExpensesClassificationType
{
    [XmlElement("classificationType")]
    public ExpensesClassificationValueType? ClassificationType { get; set; }

    [XmlElement("classificationCategory")]
    public ExpensesClassificationCategoryType? ClassificationCategory { get; set; }

    [XmlElement("amount")]
    public decimal Amount { get; set; }

    [XmlElement("vatAmount")]
    public decimal? VatAmount { get; set; }

    [XmlElement("vatCategory")]
    public VatType? VatCategory { get; set; }

    [XmlElement("vatExemptionCategory")]
    public VatExemptionType? VatExemptionCategory { get; set; }

    [XmlElement("id")]
    public byte? Id { get; set; }
}
