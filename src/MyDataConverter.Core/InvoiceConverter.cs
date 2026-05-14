using System.Reflection;
using System.Xml.Serialization;
using fiskaltrust.ifPOS.v2;
using fiskaltrust.ifPOS.v2.Cases;

namespace MyDataConverter;

/// <summary>
/// Converts a MyData <see cref="InvoicesDoc"/> back into one or more fiskaltrust.Middleware
/// inbound <see cref="ReceiptRequest"/> objects. This is the inverse of
/// <c>fiskaltrust.Middleware.SCU.GR.MyData.AADEFactory.MapToInvoicesDoc</c>.
///
/// The conversion is intentionally lossy. To still guarantee that a round-trip produces an
/// identical InvoicesDoc, we additionally write a <c>mydataoverride</c> payload that pins
/// the original invoiceType.
/// </summary>
public static class InvoiceConverter
{
    // GR + version 2 — matches what's used throughout the SCU code:
    //   ((ReceiptCase) 0x4752_2000_0000_0000).WithCase(...)
    private const string CountryCode = "GR";

    public static ReceiptRequest Convert(AadeBookInvoiceType invoice)
    {
        var (baseCase, refundFlag, transportFlag) = MapInvoiceType(invoice.invoiceHeader.invoiceType);

        var receiptCase = ReceiptCase.UnknownReceipt0x0000
            .WithCountry(CountryCode)
            .WithCase(baseCase);

        if (invoice.invoiceHeader.invoiceType is InvoiceType.Item111 or InvoiceType.Item112
            or InvoiceType.Item113 or InvoiceType.Item114 or InvoiceType.Item115
            or InvoiceType.Item84 or InvoiceType.Item85 or InvoiceType.Item93)
        {
            receiptCase = receiptCase.WithType(ReceiptCaseType.Receipt);
        }
        else if (invoice.invoiceHeader.invoiceType == InvoiceType.Item86)
        {
            receiptCase = receiptCase.WithType(ReceiptCaseType.Log);
        }
        else
        {
            receiptCase = receiptCase.WithType(ReceiptCaseType.Invoice);
        }

        if (refundFlag)
        {
            receiptCase = receiptCase.WithFlag(ReceiptCaseFlags.Refund);
        }
        if (transportFlag)
        {
            // ReceiptCaseFlagsGR.HasTransportInformation = 0x0000_0000_0400_0000
            receiptCase = (ReceiptCase) ((long) receiptCase | 0x0000_0000_0400_0000);
        }

        var sign = refundFlag ? -1m : 1m;

        var chargeItems = (invoice.invoiceDetails ?? Array.Empty<InvoiceRowType>())
            .Select(row => MapChargeItem(row, sign))
            .ToList();

        var payItems = (invoice.paymentMethods ?? Array.Empty<PaymentMethodDetailType>())
            .Select(p => MapPayItem(p, sign))
            .ToList();

        var issueDate = invoice.invoiceHeader.issueDate;
        if (issueDate.Kind == DateTimeKind.Unspecified)
        {
            issueDate = DateTime.SpecifyKind(issueDate, DateTimeKind.Utc);
        }

        var totalGross = invoice.invoiceSummary?.totalGrossValue * sign
                         ?? chargeItems.Sum(c => c.Amount);

        return new ReceiptRequest
        {
            ftCashBoxID = Guid.Empty,
            ftPosSystemId = Guid.Empty,
            ftReceiptCase = receiptCase,
            cbTerminalID = "1",
            Currency = MapCurrency(invoice.invoiceHeader),
            cbReceiptMoment = issueDate,
            cbReceiptReference = BuildReceiptReference(invoice),
            cbReceiptAmount = totalGross,
            cbChargeItems = chargeItems,
            cbPayItems = payItems,
            cbCustomer = MapCustomer(invoice.counterpart),
            ftReceiptCaseData = BuildReceiptCaseData(invoice),
        };
    }

    private static string BuildReceiptReference(AadeBookInvoiceType invoice)
    {
        var series = invoice.invoiceHeader.series ?? "series";
        var aa = invoice.invoiceHeader.aa ?? "0";
        return $"{series}-{aa}";
    }

    private static Currency MapCurrency(InvoiceHeaderType header)
    {
        if (header.currencySpecified && Enum.TryParse<Currency>(header.currency.ToString(), out var c))
        {
            return c;
        }
        return Currency.EUR;
    }

    private static object? MapCustomer(PartyType? counterpart)
    {
        if (counterpart == null)
        {
            return null;
        }

        var country = counterpart.country.ToString();
        return new
        {
            CustomerName = counterpart.name,
            CustomerVATId = string.IsNullOrEmpty(counterpart.vatNumber)
                ? null
                : (counterpart.country == CountryType.GR ? counterpart.vatNumber : country + counterpart.vatNumber),
            CustomerCountry = country,
            CustomerStreet = counterpart.address?.street,
            CustomerHouseNumber = counterpart.address?.number,
            CustomerZip = counterpart.address?.postalCode,
            CustomerCity = counterpart.address?.city,
        };
    }

    private static ChargeItem MapChargeItem(InvoiceRowType row, decimal sign)
    {
        var (vatRate, vatBits) = MapVatCategory(row.vatCategory);

        var net = row.netValue * sign;
        var vat = row.vatAmount * sign;
        var gross = net + vat;

        var chargeCase = ChargeItemCase.UnknownService
            .WithCountry(CountryCode)
            .WithVat(vatBits)
            .WithTypeOfService(ChargeItemCaseTypeOfService.UnknownService);

        return new ChargeItem
        {
            Position = row.lineNumber,
            Quantity = row.quantitySpecified ? row.quantity : 1m,
            Amount = gross,
            VATRate = vatRate,
            VATAmount = vat,
            Description = row.itemDescr,
            ProductNumber = row.itemCode,
            Unit = MapMeasurementUnit(row.measurementUnitSpecified ? row.measurementUnit : 1),
            ftChargeItemCase = chargeCase,
        };
    }

    private static PayItem MapPayItem(PaymentMethodDetailType pm, decimal sign)
    {
        var payCase = PayItemCase.UnknownPaymentType
            .WithCountry(CountryCode)
            .WithCase(MapPaymentType(pm.type));

        return new PayItem
        {
            Amount = pm.amount * sign,
            Description = pm.paymentMethodInfo,
            ftPayItemCase = payCase,
        };
    }

    private static (decimal vatRate, ChargeItemCase vatBits) MapVatCategory(int vatCategory)
    {
        return vatCategory switch
        {
            1 => (24m, ChargeItemCase.NormalVatRate),
            2 => (13m, ChargeItemCase.DiscountedVatRate1),
            3 => (6m, ChargeItemCase.DiscountedVatRate1),
            4 => (17m, ChargeItemCase.DiscountedVatRate1),
            5 => (9m, ChargeItemCase.DiscountedVatRate1),
            6 => (4m, ChargeItemCase.SuperReducedVatRate1),
            7 => (0m, ChargeItemCase.ZeroVatRate),
            8 => (0m, ChargeItemCase.NotTaxable),
            9 => (3m, ChargeItemCase.ParkingVatRate),
            10 => (4m, ChargeItemCase.ParkingVatRate),
            _ => (0m, ChargeItemCase.UnknownService),
        };
    }

    private static PayItemCase MapPaymentType(int type) => type switch
    {
        1 => PayItemCase.SEPATransfer,
        2 => PayItemCase.OtherBankTransfer,
        3 => PayItemCase.CashPayment,
        4 => PayItemCase.VoucherPaymentCouponVoucherByMoneyValue,
        5 => PayItemCase.AccountsReceivable,
        6 => PayItemCase.SEPATransfer,
        7 => PayItemCase.CreditCardPayment,
        8 => PayItemCase.SEPATransfer,
        _ => PayItemCase.UnknownPaymentType,
    };

    private static string MapMeasurementUnit(int unit) => unit switch
    {
        1 => "Pieces",
        2 => "Kg",
        3 => "Litres",
        4 => "Meters",
        5 => "SquareMeters",
        6 => "CubicMeters",
        7 => "OtherPieces",
        _ => "Pieces",
    };

    /// <summary>
    /// Picks a sensible base ReceiptCase for the given invoice type. The exact invoice type
    /// is always pinned again via the mydataoverride to guarantee round-tripping.
    /// </summary>
    private static (ReceiptCase baseCase, bool refund, bool transport) MapInvoiceType(InvoiceType invoiceType)
    {
        return invoiceType switch
        {
            InvoiceType.Item84 => (ReceiptCase.PaymentTransfer0x0002, false, false),
            InvoiceType.Item85 => (ReceiptCase.PaymentTransfer0x0002, true, false),
            InvoiceType.Item86 => (ReceiptCase.Order0x3004, false, false),
            InvoiceType.Item93 => (ReceiptCase.DeliveryNote0x0005, false, true),

            InvoiceType.Item111 => (ReceiptCase.PointOfSaleReceipt0x0001, false, false),
            InvoiceType.Item112 => (ReceiptCase.PointOfSaleReceipt0x0001, false, false),
            InvoiceType.Item113 => (ReceiptCase.PointOfSaleReceipt0x0001, false, false),
            InvoiceType.Item114 => (ReceiptCase.PointOfSaleReceipt0x0001, true, false),
            InvoiceType.Item115 => (ReceiptCase.PointOfSaleReceipt0x0001, false, false),

            // Refund invoice types
            InvoiceType.Item16 => (ReceiptCase.UnknownReceipt0x0000, true, false),
            InvoiceType.Item24 => (ReceiptCase.UnknownReceipt0x0000, true, false),
            InvoiceType.Item51 => (ReceiptCase.UnknownReceipt0x0000, true, false),
            InvoiceType.Item52 => (ReceiptCase.UnknownReceipt0x0000, true, false),

            // Everything else maps to a generic invoice base
            _ => (ReceiptCase.UnknownReceipt0x0000, false, false),
        };
    }

    private static object BuildReceiptCaseData(AadeBookInvoiceType invoice)
    {
        var invoiceTypeStr = GetXmlEnumValue(invoice.invoiceHeader.invoiceType);

        return new
        {
            GR = new
            {
                Series = invoice.invoiceHeader.series,
                AA = long.TryParse(invoice.invoiceHeader.aa, out var aaNum) ? aaNum : (long?) null,
                mydataoverride = new
                {
                    invoice = new
                    {
                        invoiceHeader = new
                        {
                            invoiceType = invoiceTypeStr,
                        }
                    }
                }
            }
        };
    }

    private static string? GetXmlEnumValue(InvoiceType value)
    {
        var member = typeof(InvoiceType).GetMember(value.ToString()).FirstOrDefault();
        var attr = member?.GetCustomAttribute<XmlEnumAttribute>();
        return attr?.Name ?? value.ToString();
    }
}
