using System.Xml.Serialization;

namespace fiskaltrust.Api.Government.GR.MyData.Models;

/// <summary>Invoice types as defined in myDATA XSD v1.0.12</summary>
public enum InvoiceType
{
    [XmlEnum("1.1")] SalesInvoice = 11,
    [XmlEnum("1.2")] SalesInvoiceForIntraCommunity = 12,
    [XmlEnum("1.3")] SalesInvoiceForThirdCountry = 13,
    [XmlEnum("1.4")] SalesInvoiceForIntraCommunityWithForeignVat = 14,
    [XmlEnum("1.5")] SalesInvoiceForThirdCountryWithForeignVat = 15,
    [XmlEnum("1.6")] SalesInvoiceSupplementary = 16,
    [XmlEnum("2.1")] ServiceInvoice = 21,
    [XmlEnum("2.2")] ServiceInvoiceIntraCommunity = 22,
    [XmlEnum("2.3")] ServiceInvoiceThirdCountry = 23,
    [XmlEnum("2.4")] ServiceInvoiceSupplementary = 24,
    [XmlEnum("3.1")] ProofOfExpense = 31,
    [XmlEnum("3.2")] ProofOfExpenseIntraCommunity = 32,
    [XmlEnum("5.1")] CreditInvoiceAssociated = 51,
    [XmlEnum("5.2")] CreditInvoiceNonAssociated = 52,
    [XmlEnum("6.1")] SelfDelivery = 61,
    [XmlEnum("6.2")] SelfUseOfServices = 62,
    [XmlEnum("7.1")] ContractIncome = 71,
    [XmlEnum("8.1")] Rent = 81,
    [XmlEnum("8.2")] RentReceipt = 82,
    [XmlEnum("8.4")] RentProofOfReceiptForTaxFree = 84,
    [XmlEnum("8.5")] RentProofOfReceiptByThirdParty = 85,
    [XmlEnum("11.1")] RetailSalesReceipt = 111,
    [XmlEnum("11.2")] ServiceReceipt = 112,
    [XmlEnum("11.3")] SimplifiedInvoice = 113,
    [XmlEnum("11.4")] RetailCreditNote = 114,
    [XmlEnum("11.5")] RetailReceiptOnBehalfOfThirdParty = 115,
    [XmlEnum("13.1")] ExpensesPurchaseRetail = 131,
    [XmlEnum("13.2")] ExpensesProvisionOfServicesRetail = 132,
    [XmlEnum("13.3")] SharedExpenses = 133,
    [XmlEnum("13.4")] Subscriptions = 134,
    [XmlEnum("13.30")] EntityReceipts = 1330,
    [XmlEnum("13.31")] DomesticForeignSalesOnBehalfOfFarmer = 1331,
    [XmlEnum("14.1")] InvoiceForIntraCommunityAcquisitions = 141,
    [XmlEnum("14.2")] InvoiceForThirdCountryAcquisitions = 142,
    [XmlEnum("14.3")] InvoiceForIntraCommunityServicesReceived = 143,
    [XmlEnum("14.4")] InvoiceForThirdCountryServicesReceived = 144,
    [XmlEnum("14.5")] EFKAAndInsuranceOrganizations = 145,
    [XmlEnum("14.30")] EntityReceiptsAndDocuments = 1430,
    [XmlEnum("14.31")] DomesticForeignPurchasesFarmer = 1431,
    [XmlEnum("15.1")] ContractExpense = 151,
    [XmlEnum("16.1")] RentExpense = 161,
    [XmlEnum("17.1")] Payroll = 171,
    [XmlEnum("17.2")] Depreciation = 172,
    [XmlEnum("17.3")] OtherIncomeAdjustmentEntries = 173,
    [XmlEnum("17.4")] OtherIncomeAdjustmentEntriesForForeignEntity = 174,
    [XmlEnum("17.5")] OtherExpenseAdjustmentEntries = 175,
    [XmlEnum("17.6")] OtherExpenseAdjustmentEntriesForForeignEntity = 176
}

/// <summary>VAT category types (1-10)</summary>
public enum VatType
{
    [XmlEnum("1")] Rate24 = 1,
    [XmlEnum("2")] Rate13 = 2,
    [XmlEnum("3")] Rate6 = 3,
    [XmlEnum("4")] Rate17 = 4,
    [XmlEnum("5")] Rate9 = 5,
    [XmlEnum("6")] Rate4 = 6,
    [XmlEnum("7")] ZeroRate = 7,
    [XmlEnum("8")] NotSubjectToVat = 8,
    [XmlEnum("9")] Rate3 = 9,
    [XmlEnum("10")] Rate0SpecialRegime = 10
}

/// <summary>VAT exemption types (1-31)</summary>
public enum VatExemptionType
{
    [XmlEnum("1")] NoVatArticle3 = 1,
    [XmlEnum("2")] NoVatArticle5 = 2,
    [XmlEnum("3")] NoVatArticle13 = 3,
    [XmlEnum("4")] NoVatArticle14 = 4,
    [XmlEnum("5")] NoVatArticle16 = 5,
    [XmlEnum("6")] NoVatArticle19 = 6,
    [XmlEnum("7")] NoVatArticle22 = 7,
    [XmlEnum("8")] NoVatArticle24 = 8,
    [XmlEnum("9")] NoVatArticle25 = 9,
    [XmlEnum("10")] NoVatArticle26 = 10,
    [XmlEnum("11")] NoVatArticle27 = 11,
    [XmlEnum("12")] NoVatArticle27OpenSeas = 12,
    [XmlEnum("13")] NoVatArticle27_1 = 13,
    [XmlEnum("14")] NoVatArticle36 = 14,
    [XmlEnum("15")] NoVatArticle39a = 15,
    [XmlEnum("16")] NoVatArticle39b = 16,
    [XmlEnum("17")] NoVatArticle40 = 17,
    [XmlEnum("18")] NoVatArticle41 = 18,
    [XmlEnum("19")] NoVatArticle47 = 19,
    [XmlEnum("20")] NoVatPol1029_1995 = 20,
    [XmlEnum("21")] NoVatPol1167_2015 = 21,
    [XmlEnum("22")] NoVatOtherExemptions = 22,
    [XmlEnum("23")] NoVatArticle43 = 23,
    [XmlEnum("24")] NoVatArticle44 = 24,
    [XmlEnum("25")] NoVatArticle45 = 25,
    [XmlEnum("26")] NoVatArticle46 = 26,
    [XmlEnum("27")] NoVatMergeScheme = 27,
    [XmlEnum("28")] NoVatArticle6 = 28,
    [XmlEnum("29")] NoVatPol1137_2018 = 29,
    [XmlEnum("30")] NoVatOtherExemptions2 = 30,
    [XmlEnum("31")] NoVatIcTriangularArrangement = 31
}

/// <summary>Withholding tax categories (1-18)</summary>
public enum WithheldType
{
    [XmlEnum("1")] InterestDividendRights = 1,
    [XmlEnum("2")] RoyaltiesTechnicalAssistance = 2,
    [XmlEnum("3")] ManagementAdvisoryFees = 3,
    [XmlEnum("4")] TechnicalWorks = 4,
    [XmlEnum("5")] FluidFuelsOtherGoods = 5,
    [XmlEnum("6")] ProductsAndServices = 6,
    [XmlEnum("7")] ArchitectsEngineersOtherServices = 7,
    [XmlEnum("8")] ManagementAdvisoryFees2 = 8,
    [XmlEnum("9")] ArchitectsEngineersOtherServices2 = 9,
    [XmlEnum("10")] Lawyers = 10,
    [XmlEnum("11")] PayrollAndPensions = 11,
    [XmlEnum("12")] Compensations = 12,
    [XmlEnum("13")] OtherWithholdings = 13,
    [XmlEnum("14")] ShortTermLease = 14,
    [XmlEnum("15")] WithheldOnDividendShareholderNatural = 15,
    [XmlEnum("16")] WithheldOnDividendShareholderLegal = 16,
    [XmlEnum("17")] MerchantTransactionWithholding = 17,
    [XmlEnum("18")] InternationalTransactions = 18
}

/// <summary>Stamp duty categories (1-4)</summary>
public enum StampDutyType
{
    [XmlEnum("1")] Rate1_2 = 1,
    [XmlEnum("2")] Rate2_4 = 2,
    [XmlEnum("3")] Rate3_6 = 3,
    [XmlEnum("4")] OtherCases = 4
}

/// <summary>Fee categories (1-22)</summary>
public enum FeesType
{
    [XmlEnum("1")] MonthlyAccountFee12Percent = 1,
    [XmlEnum("2")] MonthlyAccountFee15Percent = 2,
    [XmlEnum("3")] MonthlyAccountFee18Percent = 3,
    [XmlEnum("4")] MonthlyAccountFee20Percent = 4,
    [XmlEnum("5")] MobileCardFee12Percent = 5,
    [XmlEnum("6")] MobileCardFee15Percent = 6,
    [XmlEnum("7")] MobileCardFee18Percent = 7,
    [XmlEnum("8")] MobileCardFee20Percent = 8,
    [XmlEnum("9")] TvSubscription10Percent = 9,
    [XmlEnum("10")] TvSubscription0Percent = 10,
    [XmlEnum("11")] TelephoneFee5Percent = 11,
    [XmlEnum("12")] TelephoneFee0Percent = 12,
    [XmlEnum("13")] EnvironmentalFee = 13,
    [XmlEnum("14")] PlasticBagFee = 14,
    [XmlEnum("15")] RecyclingFee = 15,
    [XmlEnum("16")] AccommodationStayFee = 16,
    [XmlEnum("17")] AccommodationStayFeeRoomApartment = 17,
    [XmlEnum("18")] CafeteriaRestaurantFee = 18,
    [XmlEnum("19")] CasinoFee = 19,
    [XmlEnum("20")] TvSubscription10PercentNew = 20,
    [XmlEnum("21")] GreenFee = 21,
    [XmlEnum("22")] OtherFees = 22
}

/// <summary>Other taxes categories (1-30)</summary>
public enum OtherTaxesType
{
    [XmlEnum("1")] InsuranceTaxFire = 1,
    [XmlEnum("2")] InsuranceTaxLife = 2,
    [XmlEnum("3")] InsuranceTaxOther = 3,
    [XmlEnum("4")] OgaStampDutyOnInsurance = 4,
    [XmlEnum("5")] HotelTax1_2Stars = 5,
    [XmlEnum("6")] HotelTax3Stars = 6,
    [XmlEnum("7")] HotelTax4Stars = 7,
    [XmlEnum("8")] HotelTax5Stars = 8,
    [XmlEnum("9")] FurnishedRoomsFee1_2Keys = 9,
    [XmlEnum("10")] FurnishedRoomsFee3Keys = 10,
    [XmlEnum("11")] FurnishedRoomsFee4Keys = 11,
    [XmlEnum("12")] TvAdvertisingTax = 12,
    [XmlEnum("13")] LuxuryTax10 = 13,
    [XmlEnum("14")] LuxuryTax15Intra = 14,
    [XmlEnum("15")] LuxuryTax15ThirdCountry = 15,
    [XmlEnum("16")] CasinoTicketFee = 16,
    [XmlEnum("17")] FireInsurancePremium20 = 17,
    [XmlEnum("18")] CustomsDuties = 18,
    [XmlEnum("19")] OtherCustomsDuties = 19,
    [XmlEnum("20")] CharitableDutyOnImports = 20,
    [XmlEnum("21")] OtherTaxes = 21,
    [XmlEnum("22")] SpecialConsumptionTax = 22,
    [XmlEnum("23")] SocialSolidarityContribution = 23,
    [XmlEnum("24")] ExciseDutyOnCoffee = 24,
    [XmlEnum("25")] ExciseDutyOnElectronicCigarette = 25,
    [XmlEnum("26")] EnvironmentalProtectionFee = 26,
    [XmlEnum("27")] InsuranceContributionCharge = 27,
    [XmlEnum("28")] ExciseDutyOnEnergy = 28,
    [XmlEnum("29")] DevelopmentalSurcharge = 29,
    [XmlEnum("30")] OtherTaxesAndDuties = 30
}

/// <summary>Measurement unit types (1-7)</summary>
public enum QuantityType
{
    [XmlEnum("1")] Pieces = 1,
    [XmlEnum("2")] Kilograms = 2,
    [XmlEnum("3")] Liters = 3,
    [XmlEnum("4")] Meters = 4,
    [XmlEnum("5")] SquareMeters = 5,
    [XmlEnum("6")] CubicMeters = 6,
    [XmlEnum("7")] Items = 7
}

/// <summary>Invoice detail type (1-2)</summary>
public enum InvoiceDetailType
{
    [XmlEnum("1")] ClearLineItem = 1,
    [XmlEnum("2")] VatIncludedLineItem = 2
}

/// <summary>Special invoice category (1-13)</summary>
public enum SpecialInvoiceCategoryType
{
    [XmlEnum("1")] Subsidies = 1,
    [XmlEnum("2")] HotelRetailRevenue = 2,
    [XmlEnum("3")] AccountingEntry = 3,
    [XmlEnum("4")] TaxFree = 4,
    [XmlEnum("5")] ComplexTransactions = 5,
    [XmlEnum("6")] ArticleMonProt = 6,
    [XmlEnum("7")] SellerOnHisBehalf = 7,
    [XmlEnum("8")] InvoiceForSaleOnBehalf = 8,
    [XmlEnum("9")] InvoiceForSaleOnBehalfOfThirdParty = 9,
    [XmlEnum("10")] DueToThirdPartyReceipts = 10,
    [XmlEnum("11")] InvoiceForThirdPartyService = 11,
    [XmlEnum("12")] InvoiceForThirdPartyService2 = 12,
    [XmlEnum("13")] TransitionAdjustment = 13
}

/// <summary>Invoice variation type (1-4)</summary>
public enum InvoiceVariationType
{
    [XmlEnum("1")] QuoteOrProposal = 1,
    [XmlEnum("2")] GoodsDeliveryOrReceived = 2,
    [XmlEnum("3")] ReturnsOfGoodsOrRefusalOfService = 3,
    [XmlEnum("4")] PaymentsInAdvance = 4
}

/// <summary>Payment method type (1-8)</summary>
public enum PaymentMethodType
{
    [XmlEnum("1")] DomesticPaymentAccount = 1,
    [XmlEnum("2")] InternationalPaymentAccount = 2,
    [XmlEnum("3")] Cash = 3,
    [XmlEnum("4")] Cheque = 4,
    [XmlEnum("5")] OnCredit = 5,
    [XmlEnum("6")] WebBanking = 6,
    [XmlEnum("7")] POS = 7,
    [XmlEnum("8")] Iris = 8
}

/// <summary>Move purpose (1-20)</summary>
public enum MovePurposeType
{
    [XmlEnum("1")] Sale = 1,
    [XmlEnum("2")] ThirdPartySales = 2,
    [XmlEnum("3")] Sampling = 3,
    [XmlEnum("4")] Exhibition = 4,
    [XmlEnum("5")] Return = 5,
    [XmlEnum("6")] Storage = 6,
    [XmlEnum("7")] Processing = 7,
    [XmlEnum("8")] BetweenFacilities = 8,
    [XmlEnum("9")] InternalUse = 9,
    [XmlEnum("10")] Transfer = 10,
    [XmlEnum("11")] Other = 11,
    [XmlEnum("12")] Sale12 = 12,
    [XmlEnum("13")] Sale13 = 13,
    [XmlEnum("14")] Sale14 = 14,
    [XmlEnum("15")] Sale15 = 15,
    [XmlEnum("16")] Sale16 = 16,
    [XmlEnum("17")] Sale17 = 17,
    [XmlEnum("18")] Sale18 = 18,
    [XmlEnum("19")] Sale19 = 19,
    [XmlEnum("20")] Sale20 = 20
}

/// <summary>Tax totals type (1-5)</summary>
public enum TaxType
{
    [XmlEnum("1")] WithheldTax = 1,
    [XmlEnum("2")] StampDuty = 2,
    [XmlEnum("3")] Fees = 3,
    [XmlEnum("4")] OtherTaxes = 4,
    [XmlEnum("5")] Deductions = 5
}

/// <summary>Entity category type (1-6)</summary>
public enum EntityCategoryType
{
    [XmlEnum("1")] TaxRepresentative = 1,
    [XmlEnum("2")] Intermediary = 2,
    [XmlEnum("3")] Shipper = 3,
    [XmlEnum("4")] BillOfLadingRecipient = 4,
    [XmlEnum("5")] Dispatcher = 5,
    [XmlEnum("6")] TransportCompany = 6
}

/// <summary>Transmission failure type (1-4)</summary>
public enum TransmissionFailureType
{
    [XmlEnum("1")] NetworkFailure = 1,
    [XmlEnum("2")] TechnicalFailure = 2,
    [XmlEnum("3")] ProviderNetworkFailure = 3,
    [XmlEnum("4")] ProviderTechnicalFailure = 4
}

/// <summary>Line record type (1-7)</summary>
public enum RecType
{
    [XmlEnum("1")] Normal = 1,
    [XmlEnum("2")] VatRegimeExcluded = 2,
    [XmlEnum("3")] NegativeSign = 3,
    [XmlEnum("4")] InformationOnly = 4,
    [XmlEnum("5")] VatInclusive = 5,
    [XmlEnum("6")] NegativeSignWithoutVat = 6,
    [XmlEnum("7")] NegativeSignVatInclusive = 7
}

/// <summary>Reverse delivery note purpose type (1-5)</summary>
public enum ReverseDeliveryNotePurposeType
{
    [XmlEnum("1")] RejectionByReceiver = 1,
    [XmlEnum("2")] ReturnToSender = 2,
    [XmlEnum("3")] WrongDelivery = 3,
    [XmlEnum("4")] SurplusInventory = 4,
    [XmlEnum("5")] Other = 5
}

/// <summary>Income classification category</summary>
public enum IncomeClassificationCategoryType
{
    [XmlEnum("category1_1")] Category1_1 = 1,
    [XmlEnum("category1_2")] Category1_2 = 2,
    [XmlEnum("category1_3")] Category1_3 = 3,
    [XmlEnum("category1_4")] Category1_4 = 4,
    [XmlEnum("category1_5")] Category1_5 = 5,
    [XmlEnum("category1_6")] Category1_6 = 6,
    [XmlEnum("category1_7")] Category1_7 = 7,
    [XmlEnum("category1_8")] Category1_8 = 8,
    [XmlEnum("category1_9")] Category1_9 = 9,
    [XmlEnum("category1_10")] Category1_10 = 10,
    [XmlEnum("category1_95")] Category1_95 = 95,
    [XmlEnum("category3")] Category3 = 100
}

/// <summary>Expenses classification category</summary>
public enum ExpensesClassificationCategoryType
{
    [XmlEnum("category2_1")] Category2_1 = 1,
    [XmlEnum("category2_2")] Category2_2 = 2,
    [XmlEnum("category2_3")] Category2_3 = 3,
    [XmlEnum("category2_4")] Category2_4 = 4,
    [XmlEnum("category2_5")] Category2_5 = 5,
    [XmlEnum("category2_6")] Category2_6 = 6,
    [XmlEnum("category2_7")] Category2_7 = 7,
    [XmlEnum("category2_8")] Category2_8 = 8,
    [XmlEnum("category2_9")] Category2_9 = 9,
    [XmlEnum("category2_10")] Category2_10 = 10,
    [XmlEnum("category2_11")] Category2_11 = 11,
    [XmlEnum("category2_12")] Category2_12 = 12,
    [XmlEnum("category2_13")] Category2_13 = 13,
    [XmlEnum("category2_14")] Category2_14 = 14,
    [XmlEnum("category2_95")] Category2_95 = 95
}

/// <summary>Income classification value type (E3 codes)</summary>
public enum IncomeClassificationValueType
{
    [XmlEnum("E3_106_001")] E3_106_001,
    [XmlEnum("E3_106_002")] E3_106_002,
    [XmlEnum("E3_106_003")] E3_106_003,
    [XmlEnum("E3_106_004")] E3_106_004,
    [XmlEnum("E3_106_005")] E3_106_005,
    [XmlEnum("E3_106_006")] E3_106_006,
    [XmlEnum("E3_106_007")] E3_106_007,
    [XmlEnum("E3_106_008")] E3_106_008,
    [XmlEnum("E3_106_009")] E3_106_009,
    [XmlEnum("E3_205_001")] E3_205_001,
    [XmlEnum("E3_205_002")] E3_205_002,
    [XmlEnum("E3_205_003")] E3_205_003,
    [XmlEnum("E3_205_004")] E3_205_004,
    [XmlEnum("E3_205_005")] E3_205_005,
    [XmlEnum("E3_205_006")] E3_205_006,
    [XmlEnum("E3_205_007")] E3_205_007,
    [XmlEnum("E3_205_008")] E3_205_008,
    [XmlEnum("E3_205_009")] E3_205_009,
    [XmlEnum("E3_207")] E3_207,
    [XmlEnum("E3_210")] E3_210,
    [XmlEnum("E3_305_001")] E3_305_001,
    [XmlEnum("E3_305_002")] E3_305_002,
    [XmlEnum("E3_305_003")] E3_305_003,
    [XmlEnum("E3_305_004")] E3_305_004,
    [XmlEnum("E3_305_005")] E3_305_005,
    [XmlEnum("E3_305_006")] E3_305_006,
    [XmlEnum("E3_305_007")] E3_305_007,
    [XmlEnum("E3_305_008")] E3_305_008,
    [XmlEnum("E3_305_009")] E3_305_009,
    [XmlEnum("E3_313")] E3_313,
    [XmlEnum("E3_581_001")] E3_581_001,
    [XmlEnum("E3_581_002")] E3_581_002,
    [XmlEnum("E3_581_003")] E3_581_003,
    [XmlEnum("E3_596")] E3_596,
    [XmlEnum("E3_597")] E3_597,
    [XmlEnum("E3_880_001")] E3_880_001,
    [XmlEnum("E3_880_002")] E3_880_002,
    [XmlEnum("E3_880_003")] E3_880_003,
    [XmlEnum("E3_880_004")] E3_880_004,
    [XmlEnum("E3_881_001")] E3_881_001,
    [XmlEnum("E3_881_002")] E3_881_002,
    [XmlEnum("E3_881_003")] E3_881_003,
    [XmlEnum("E3_881_004")] E3_881_004
}

/// <summary>Expenses classification value type (E3 codes)</summary>
public enum ExpensesClassificationValueType
{
    [XmlEnum("E3_101")] E3_101,
    [XmlEnum("E3_102_001")] E3_102_001,
    [XmlEnum("E3_102_002")] E3_102_002,
    [XmlEnum("E3_102_003")] E3_102_003,
    [XmlEnum("E3_102_004")] E3_102_004,
    [XmlEnum("E3_102_005")] E3_102_005,
    [XmlEnum("E3_102_006")] E3_102_006,
    [XmlEnum("E3_104")] E3_104,
    [XmlEnum("E3_201")] E3_201,
    [XmlEnum("E3_202_001")] E3_202_001,
    [XmlEnum("E3_202_002")] E3_202_002,
    [XmlEnum("E3_202_003")] E3_202_003,
    [XmlEnum("E3_202_004")] E3_202_004,
    [XmlEnum("E3_202_005")] E3_202_005,
    [XmlEnum("E3_204")] E3_204,
    [XmlEnum("E3_207")] E3_207,
    [XmlEnum("E3_209")] E3_209,
    [XmlEnum("E3_301")] E3_301,
    [XmlEnum("E3_302_001")] E3_302_001,
    [XmlEnum("E3_302_002")] E3_302_002,
    [XmlEnum("E3_302_003")] E3_302_003,
    [XmlEnum("E3_302_004")] E3_302_004,
    [XmlEnum("E3_302_005")] E3_302_005,
    [XmlEnum("E3_304")] E3_304,
    [XmlEnum("E3_307")] E3_307,
    [XmlEnum("E3_309")] E3_309,
    [XmlEnum("E3_312")] E3_312,
    [XmlEnum("E3_313")] E3_313,
    [XmlEnum("E3_315")] E3_315,
    [XmlEnum("E3_581_001")] E3_581_001,
    [XmlEnum("E3_581_002")] E3_581_002,
    [XmlEnum("E3_581_003")] E3_581_003,
    [XmlEnum("E3_582")] E3_582,
    [XmlEnum("E3_583")] E3_583,
    [XmlEnum("E3_584")] E3_584,
    [XmlEnum("E3_585_001")] E3_585_001,
    [XmlEnum("E3_585_002")] E3_585_002,
    [XmlEnum("E3_585_003")] E3_585_003,
    [XmlEnum("E3_585_004")] E3_585_004,
    [XmlEnum("E3_585_005")] E3_585_005,
    [XmlEnum("E3_585_006")] E3_585_006,
    [XmlEnum("E3_585_007")] E3_585_007,
    [XmlEnum("E3_585_008")] E3_585_008,
    [XmlEnum("E3_585_009")] E3_585_009,
    [XmlEnum("E3_585_010")] E3_585_010,
    [XmlEnum("E3_585_011")] E3_585_011,
    [XmlEnum("E3_585_012")] E3_585_012,
    [XmlEnum("E3_585_013")] E3_585_013,
    [XmlEnum("E3_585_014")] E3_585_014,
    [XmlEnum("E3_585_015")] E3_585_015,
    [XmlEnum("E3_585_016")] E3_585_016,
    [XmlEnum("E3_586")] E3_586,
    [XmlEnum("E3_587")] E3_587,
    [XmlEnum("E3_588")] E3_588,
    [XmlEnum("E3_589")] E3_589,
    [XmlEnum("E3_881_001")] E3_881_001,
    [XmlEnum("E3_881_002")] E3_881_002,
    [XmlEnum("E3_881_003")] E3_881_003,
    [XmlEnum("E3_881_004")] E3_881_004,
    [XmlEnum("E3_882_001")] E3_882_001,
    [XmlEnum("E3_882_002")] E3_882_002,
    [XmlEnum("E3_882_003")] E3_882_003,
    [XmlEnum("E3_882_004")] E3_882_004,
    [XmlEnum("E3_883_001")] E3_883_001,
    [XmlEnum("E3_883_002")] E3_883_002,
    [XmlEnum("E3_883_003")] E3_883_003,
    [XmlEnum("E3_883_004")] E3_883_004,
    [XmlEnum("VAT_361")] VAT_361,
    [XmlEnum("VAT_362")] VAT_362,
    [XmlEnum("VAT_363")] VAT_363,
    [XmlEnum("VAT_364")] VAT_364,
    [XmlEnum("VAT_365")] VAT_365,
    [XmlEnum("VAT_366")] VAT_366,
    [XmlEnum("NOT_VAT_295")] NOT_VAT_295
}

/// <summary>Fuel codes</summary>
public enum FuelCodes
{
    [XmlEnum("10")] Benzin95RON = 10,
    [XmlEnum("11")] Benzin95RONPlus = 11,
    [XmlEnum("12")] Benzin98RON = 12,
    [XmlEnum("13")] Benzin100RON = 13,
    [XmlEnum("14")] BenzinLRP = 14,
    [XmlEnum("15")] AviationGasoline = 15,
    [XmlEnum("20")] Diesel = 20,
    [XmlEnum("21")] DieselPlus = 21,
    [XmlEnum("30")] DieselHeating = 30,
    [XmlEnum("31")] DieselHeatingPlus = 31,
    [XmlEnum("32")] DieselLight = 32,
    [XmlEnum("33")] DieselLightOther = 33,
    [XmlEnum("34")] OtherPetroleumProducts = 34,
    [XmlEnum("35")] DieselMaritime = 35,
    [XmlEnum("36")] Kerosene = 36,
    [XmlEnum("37")] KeroseneOther = 37,
    [XmlEnum("38")] OtherLiquidFuels = 38,
    [XmlEnum("40")] LPG = 40,
    [XmlEnum("41")] LPGCng = 41,
    [XmlEnum("42")] LPGOther = 42,
    [XmlEnum("50")] CNG = 50,
    [XmlEnum("60")] Electricity = 60,
    [XmlEnum("61")] ElectricityGreen = 61,
    [XmlEnum("70")] Biofuel = 70,
    [XmlEnum("71")] Biodiesel = 71,
    [XmlEnum("72")] Bioethanol = 72,
    [XmlEnum("999")] Other = 999
}

/// <summary>Transaction mode (1-2)</summary>
public enum TransactionModeType
{
    [XmlEnum("0")] Rejection = 0,
    [XmlEnum("1")] Acceptance = 1
}

/// <summary>Classification post mode (0-1)</summary>
public enum ClassificationPostModeType
{
    [XmlEnum("0")] ReplaceAll = 0,
    [XmlEnum("1")] AppendToExisting = 1
}

/// <summary>Liable user category type (1-2)</summary>
public enum LiableUserCategoryType
{
    [XmlEnum("1")] NaturalPerson = 1,
    [XmlEnum("2")] LegalEntity = 2
}

/// <summary>Provider type (1-2)</summary>
public enum ProviderTypeEnum
{
    [XmlEnum("1")] TimologioProvider = 1,
    [XmlEnum("2")] ERP = 2
}

/// <summary>Recall status type (1-2)</summary>
public enum RecallStatusType
{
    [XmlEnum("1")] Pending = 1,
    [XmlEnum("2")] Completed = 2
}
