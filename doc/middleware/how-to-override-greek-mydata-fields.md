# How to Override Greek MyData Fields in fiskaltrust ReceiptRequest

## Overview

The fiskaltrust middleware provides a mechanism to override Greek-specific MyData fields within the standard `ReceiptRequest` structure. This allows POS systems and integrations to customize invoice data that gets transmitted to the Greek tax authority's MyData system without modifying the core receipt structure.

This guide explains **what**, **why**, and **how** to use MyData field overrides programmatically.

---

## Table of Contents

1. [Architecture & Data Flow](#architecture--data-flow)
2. [Supported Override Fields](#supported-override-fields)
3. [JSON Structure & Deserialization](#json-structure--deserialization)
4. [Practical Implementation Examples](#practical-implementation-examples)
5. [Field Mapping Reference](#field-mapping-reference)
6. [Common Use Cases](#common-use-cases)
7. [Error Handling & Validation](#error-handling--validation)

---

## Architecture & Data Flow

### Where Overrides Live

MyData field overrides are embedded within the `ftReceiptCaseData` field of the `ReceiptRequest`:

```
ReceiptRequest
├── cbChargeItems[]
├── cbPayItems[]
├── cbCustomer
└── ftReceiptCaseData (JSON object)
    └── GR (Greece-specific data)
        └── mydataoverride (THE OVERRIDE CONTAINER)
            ├── invoice
            │   ├── invoiceHeader
            │   │   ├── dispatchDate
            │   │   ├── thirdPartyCollection
            │   │   ├── multipleConnectedMarks
            │   │   └── ... (other header fields)
            │   └── invoiceDetails[] (line item overrides)
            └── (future expansions)
```

### How it Works (Deserialization Flow)

1. **POS/Integration System** → Creates `ReceiptRequest` JSON with nested override data in `ftReceiptCaseData.GR.mydataoverride`
2. **Middleware Queue** → Receives the request and validates structure
3. **Deserialization Helper** → Extracts the override data from the generic JSON object
4. **MyDataSCU Processor** → Applies overrides before building the MyData XML payload
5. **MyData API** → Receives the final invoice with overridden values

---

## Supported Override Fields

### Invoice Header Level Overrides

These fields override invoice-level metadata sent to MyData:

| Field Name | Type | Description | MyData Equivalent | Example |
|---|---|---|---|---|
| `dispatchDate` | string (ISO 8601) | Date when goods were dispatched | `dispatchDate` in MyData | `"2025-06-19"` |
| `dispatchTime` | string (HH:mm) | Time of dispatch | `dispatchTime` in MyData | `"14:30"` |
| `thirdPartyCollection` | boolean | Payment collected by third party | `thirdPartyCollection` | `true` |
| `multipleConnectedMarks` | array[long] | Related invoice marks | `multipleConnectedMarks` | `[123456789, 987654321]` |
| `deliveryAddress` | object | Where goods are delivered to | Used in delivery notes | See below |

### Delivery Address Subfields

When overriding delivery address:

```json
{
  "deliveryAddress": {
    "street": "Παγκρατίου",
    "number": "45",
    "postalCode": "54623",
    "city": "Θεσσαλονίκη"
  }
}
```

| Field | Type | Description | Example |
|---|---|---|---|
| `street` | string | Street name | `"Παγκρατίου"` |
| `number` | string | Building/House number | `"45"` |
| `postalCode` | string | Postal/ZIP code | `"54623"` |
| `city` | string | City name | `"Θεσσαλονίκη"` |

### Invoice Detail (Line Item) Level Overrides

Override individual charge items within the invoice:

| Field Name | Type | Description | Example |
|---|---|---|---|
| `lineNumber` | int | Position in the invoice | `1` |
| `quantity` | decimal | Item quantity (overrides charge item) | `2.5` |
| `unitMeasurementId` | int | Unit of measure code (MyData standard) | `1` (piece) |
| `description` | string | Full item description | `"Espresso Coffee - Medium"` |
| `netValue` | decimal | Net amount before VAT | `3.50` |
| `vatAmount` | decimal | VAT amount | `0.84` |
| `vatRate` | decimal | VAT percentage | `24.0` |

---

## JSON Structure & Deserialization

### Complete JSON Example

```json
{
  "cbTerminalID": "1",
  "Currency": "EUR",
  "cbReceiptMoment": "2025-06-20T10:30:00Z",
  "cbReceiptReference": "SALE-20250620-001",
  "cbChargeItems": [
    {
      "Amount": 100.0,
      "Quantity": 1,
      "Description": "Service",
      "VATRate": 24,
      "ftChargeItemCase": 5207048243932160026
    }
  ],
  "cbPayItems": [
    {
      "Amount": 124.0,
      "Description": "Cash Payment",
      "ftPayItemCase": 5207048243932160001
    }
  ],
  "ftReceiptCase": 5139205309155246080,
  "ftReceiptCaseData": {
    "GR": {
      "mydataoverride": {
        "invoice": {
          "invoiceHeader": {
            "dispatchDate": "2025-06-21",
            "dispatchTime": "09:00",
            "thirdPartyCollection": false,
            "deliveryAddress": {
              "street": "Κηφισίας",
              "number": "12",
              "postalCode": "15124",
              "city": "Αθήνα"
            }
          }
        }
      }
    }
  }
}
```

### C# Deserialization Pattern

The middleware uses a case-insensitive JSON deserializer:

```csharp
// Extension method from ReceiptRequestExtensions.cs
public static bool TryDeserializeftReceiptCaseData<T>(
    this ReceiptRequest request, 
    out T? result) 
    where T : class
{
    result = default;
    try
    {
        if (request.ftReceiptCaseData is null)
        {
            return false;
        }
        
        result = JsonSerializer.Deserialize<T>(
            JsonSerializer.Serialize(request.ftReceiptCaseData),
            new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            }
        );
        
        return result != null;
    }
    catch (Exception)
    {
        result = default;
        return false;
    }
}
```

**Key Points:**
- Property names are **case-insensitive** (both `mydataoverride` and `MyDataOverride` work)
- Null values are ignored (missing fields don't override)
- Exceptions during deserialization are silently caught (override is skipped)

---

## Practical Implementation Examples

### Example 1: Partial Override (Only Dispatch Date)

Override only the dispatch date; all other fields use defaults:

```json
{
  "ftReceiptCaseData": {
    "GR": {
      "mydataoverride": {
        "invoice": {
          "invoiceHeader": {
            "dispatchDate": "2025-06-19"
          }
        }
      }
    }
  }
}
```

**Result:** 
- `dispatchDate` → `2025-06-19`
- Other header fields → Calculated from receipt data
- Line items → From `cbChargeItems[]`

---

### Example 2: Complete Delivery Override

Override delivery details for a delivery scenario:

```json
{
  "ftReceiptCaseData": {
    "GR": {
      "mydataoverride": {
        "invoice": {
          "invoiceHeader": {
            "dispatchDate": "2025-06-20",
            "dispatchTime": "14:30",
            "deliveryAddress": {
              "street": "Αθηνών",
              "number": "45",
              "postalCode": "54623",
              "city": "Θεσσαλονίκη"
            }
          }
        }
      }
    }
  }
}
```

**Result:**
- Invoice is marked as a delivery note
- Delivery address fields override the customer address
- Dispatch timestamp is recorded

---

### Example 3: Third-Party Collection Payment

Mark payment as collected by a third party (e.g., payment provider):

```json
{
  "ftReceiptCaseData": {
    "GR": {
      "mydataoverride": {
        "invoice": {
          "invoiceHeader": {
            "thirdPartyCollection": true
          }
        }
      }
    }
  }
}
```

**Result:**
- MyData receives `thirdPartyCollection = true`
- Payment responsibility is attributed to the third party
- Used for VivaWallet and e-payment scenarios

---

### Example 4: Multiple Connected Invoices

Reference related invoice marks (e.g., linked orders):

```json
{
  "ftReceiptCaseData": {
    "GR": {
      "mydataoverride": {
        "invoice": {
          "invoiceHeader": {
            "multipleConnectedMarks": [999111222333, 999111222334, 999111222335]
          }
        }
      }
    }
  }
}
```

**Result:**
- MyData records these three invoices as related
- Useful for split invoices or consolidated orders

---

### Example 5: Restaurant Delivery Order (Complete Scenario)

Real-world example: restaurant delivery with custom address and timing:

```json
{
  "cbTerminalID": "POS-01",
  "Currency": "EUR",
  "cbReceiptAmount": 48.50,
  "cbReceiptMoment": "2025-06-20T19:30:00Z",
  "cbReceiptReference": "DELIVERY-20250620-00156",
  "cbChargeItems": [
    {
      "Amount": 12.00,
      "Quantity": 1,
      "Description": "Grilled Salmon",
      "VATRate": 24,
      "ftChargeItemCase": 5207048243932160026
    },
    {
      "Amount": 8.50,
      "Quantity": 1,
      "Description": "Greek Salad",
      "VATRate": 24,
      "ftChargeItemCase": 5207048243932160026
    },
    {
      "Amount": 5.00,
      "Quantity": 1,
      "Description": "Delivery Fee",
      "VATRate": 24,
      "ftChargeItemCase": 5207048243932160026
    }
  ],
  "cbPayItems": [
    {
      "Amount": 48.50,
      "Description": "Cashless Payment",
      "ftPayItemCase": 5207048243932160004,
      "ftPayItemCaseData": {
        "Provider": {
          "Protocol": "VivaWallet",
          "Action": "Sale"
        }
      }
    }
  ],
  "cbCustomer": {
    "CustomerName": "Customer Name",
    "CustomerVATId": "GR123456789"
  },
  "ftReceiptCase": 5139205309155246080,
  "ftReceiptCaseData": {
    "GR": {
      "mydataoverride": {
        "invoice": {
          "invoiceHeader": {
            "dispatchDate": "2025-06-20",
            "dispatchTime": "19:45",
            "thirdPartyCollection": true,
            "deliveryAddress": {
              "street": "Δημοκρατίας",
              "number": "100",
              "postalCode": "15343",
              "city": "Αγία Παρασκευή"
            }
          }
        }
      }
    }
  }
}
```

---

## Field Mapping Reference

### How Overrides Map to MyData XML

The override fields are applied at different stages of invoice construction:

| Override Field | MyData XML Element | Processing Stage | Notes |
|---|---|---|---|
| `dispatchDate` | `invoiceHeader/dispatchDate` | Pre-transmission | Overrides calculated date |
| `dispatchTime` | `invoiceHeader/dispatchTime` | Pre-transmission | Combined with date for timestamp |
| `deliveryAddress` | `invoiceHeader/deliveryAddress/*` | Pre-transmission | Sets address for delivery notes |
| `thirdPartyCollection` | `invoiceHeader/thirdPartyCollection` | Pre-transmission | Boolean flag in header |
| `multipleConnectedMarks` | `invoiceHeader/multipleConnectedMarks[]` | Pre-transmission | Array of invoice reference marks |

### Receipt Case Interaction

The override mechanism respects the `ftReceiptCase` value:

| Receipt Case Bit | Behavior with Override |
|---|---|
| `0x4752_2000_0000_0000` (base GR) | Overrides applied normally |
| Delivery note markers | Override fields enhance delivery metadata |
| Payment-related markers | Overrides work with payment scenarios |

---

## Common Use Cases

### Use Case 1: Correcting Dispatch Time

**Scenario:** POS captured receipt at 14:00, but goods weren't dispatched until 15:30.

**Solution:**
```json
{
  "ftReceiptCaseData": {
    "GR": {
      "mydataoverride": {
        "invoice": {
          "invoiceHeader": {
            "dispatchTime": "15:30"
          }
        }
      }
    }
  }
}
```

---

### Use Case 2: Alternative Delivery Address

**Scenario:** Multiple delivery addresses for the same customer; address differs from registered customer address.

**Solution:**
```json
{
  "ftReceiptCaseData": {
    "GR": {
      "mydataoverride": {
        "invoice": {
          "invoiceHeader": {
            "deliveryAddress": {
              "street": "Πατησίων",
              "number": "200",
              "postalCode": "10437",
              "city": "Αθήνα"
            }
          }
        }
      }
    }
  }
}
```

---

### Use Case 3: Payment Provider Collection

**Scenario:** Payment processed through VivaWallet or another payment aggregator.

**Solution:**
```json
{
  "cbPayItems": [
    {
      "Amount": 124.00,
      "Description": "VivaWallet Card Payment",
      "ftPayItemCase": 5207048243932160004
    }
  ],
  "ftReceiptCaseData": {
    "GR": {
      "mydataoverride": {
        "invoice": {
          "invoiceHeader": {
            "thirdPartyCollection": true
          }
        }
      }
    }
  }
}
```

---

### Use Case 4: Split Orders Tracking

**Scenario:** Large order split into multiple invoices for kitchen logistics.

**Solution:**
```json
{
  "ftReceiptCaseData": {
    "GR": {
      "mydataoverride": {
        "invoice": {
          "invoiceHeader": {
            "multipleConnectedMarks": [999111222331, 999111222332]
          }
        }
      }
    }
  }
}
```

---

## Error Handling & Validation

### What Happens If Override Data Is Invalid?

The middleware implements **graceful degradation**:

1. **Malformed JSON** → Override silently skipped; receipt processes normally
2. **Type mismatch** (e.g., string in numeric field) → Field ignored; defaults used
3. **Invalid date format** (not ISO 8601) → Field ignored; system date used
4. **Negative amounts** → Validated against business rules; may be rejected

### Validation Rules to Follow

| Field | Validation | Action if Invalid |
|---|---|---|
| `dispatchDate` | ISO 8601 format (`YYYY-MM-DD`) | Ignored; current date used |
| `dispatchTime` | HH:mm format (`00:00` – `23:59`) | Ignored; current time used |
| `postalCode` | Non-empty string | Ignored; customer postal code used |
| `thirdPartyCollection` | Boolean | Ignored; defaults to `false` |
| `multipleConnectedMarks` | Array of positive integers | Invalid entries filtered |

### Recommended Error Handling

```csharp
// Check if override data exists before using it
if (receiptRequest.TryDeserializeftReceiptCaseData<ftReceiptCaseDataPayload>(
    out var caseData) 
    && caseData?.GR?.MyDataOverride != null)
{
    var invoice = caseData.GR.MyDataOverride.Invoice;
    
    // Validate dispatch date format
    if (!string.IsNullOrEmpty(invoice?.InvoiceHeader?.DispatchDate))
    {
        if (!DateTime.TryParseExact(
            invoice.InvoiceHeader.DispatchDate,
            "yyyy-MM-dd",
            CultureInfo.InvariantCulture,
            DateTimeStyles.None,
            out var dispatchDate))
        {
            // Log warning and proceed with defaults
            _logger.LogWarning("Invalid dispatchDate format: {date}",
                invoice.InvoiceHeader.DispatchDate);
        }
    }
}
```

---

## Integration Checklist

Use this checklist when implementing MyData field overrides:

- [ ] **Validate JSON structure** before sending to middleware
- [ ] **Use ISO 8601 dates** (`YYYY-MM-DD` format)
- [ ] **Use 24-hour time** (`HH:mm` format) for dispatch times
- [ ] **Test partial overrides** (only override what's needed)
- [ ] **Handle null responses** gracefully
- [ ] **Log override data** for audit trail
- [ ] **Monitor MyData API responses** for validation errors
- [ ] **Test with sandbox** before production deployment
- [ ] **Document any custom override patterns** in your POS system

---

## Related Documentation

- **Middleware API Reference:** [ftReceiptCaseData Specification](../../../README.md)
- **MyData XML Format:** [MyData Invoice Structure](../mydata/mydata_taxes.md)
- **Payment Mappings:** [ftPayItemCase → MyData Payment Types](./payment_mappings.md)
- **Acceptance Tests:** See `MyDataOverrideAcceptanceTests.cs` in middleware repository

---

## Support & Questions

For questions about MyData field overrides:

1. Review the **acceptance test examples** in `middleware/scu-gr/test/fiskaltrust.Middleware.SCU.GR.AcceptanceTests/MyDataOverrideAcceptanceTests.cs`
2. Check existing **issues** in the [market-gr repository](https://github.com/fiskaltrust/market-gr/issues)
3. Consult the **AADE MyData documentation** for Greek tax authority requirements
4. Open an issue with the tag `#mydataoverride` with your specific use case

---

**Last Updated:** 2025-04-15  
**Status:** Complete  
**Version:** 1.0
