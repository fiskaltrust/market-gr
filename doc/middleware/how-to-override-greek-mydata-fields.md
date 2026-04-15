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
| `invoiceType` | string | MyData invoice type (forces specific fiscal classification) | `invoiceType` in MyData | `"1.1"` |
| `dispatchDate` | string (ISO 8601) | Date when goods were dispatched | `dispatchDate` in MyData | `"2025-06-19"` |
| `dispatchTime` | string (HH:mm) | Time of dispatch | `dispatchTime` in MyData | `"14:30"` |
| `thirdPartyCollection` | boolean | Payment collected by third party | `thirdPartyCollection` | `true` |
| `multipleConnectedMarks` | array[long] | Related invoice marks | `multipleConnectedMarks` | `[123456789, 987654321]` |
| `deliveryAddress` | object | Where goods are delivered to | Used in delivery notes | See below |

#### Invoice Type Values

MyData supports the following invoice types (set via override):

| Code | Description |
|---|---|
| `1.1` | Sales Invoice (standard) |
| `1.2` | Sales Invoice - Intra-Community |
| `1.3` | Sales Invoice - Third Country |
| `1.4` | Sales Invoice - Intra-Community with Foreign VAT |
| `1.5` | Sales Invoice - Third Country with Foreign VAT |
| `1.6` | Sales Invoice - Supplementary |
| `2.1` | Service Invoice |
| `2.2` | Service Invoice - Intra-Community |
| `2.3` | Service Invoice - Third Country |
| `2.4` | Service Invoice - Supplementary |
| `3.1` | Proof of Expense |
| `3.2` | Proof of Expense - Intra-Community |
| `5.1` | Credit Memo - Associated |
| `5.2` | Credit Memo - Non-Associated |
| `6.1` | Self-Delivery of Goods |
| `6.2` | Self-Use of Services |
| `7.1` | Contract Income |
| `8.1` | Rent Invoice |
| `8.2` | Rent Receipt |
| `8.4` | Rent - Tax-Free Proof |
| `8.5` | Rent - Third-Party Proof |
| `11.1` | Retail Sales Receipt |
| `11.2` | Service Receipt |
| `11.3` | Simplified Invoice |
| `11.4` | Retail Credit Note |
| `11.5` | Retail Receipt - On Behalf of Third Party |
| `13.1` | Expenses - Retail Purchase |
| `13.2` | Expenses - Retail Service |
| `13.3` | Shared Expenses |
| `13.4` | Subscriptions |
| `14.1` | Invoice - Intra-Community Acquisitions |
| `14.2` | Invoice - Third Country Acquisitions |

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

Override individual charge items within the invoice via `ftChargeItemCaseData`:

| Field Name | Type | Description | Example |
|---|---|---|---|
| `invoiceDetails` | object | Container for line item overrides | See below |

#### Line Item Classification Fields (`invoiceDetails`)

| Field Name | Type | Description |
|---|---|---|
| `incomeClassification` | array | Income classification override (single entry only) |
| `expensesClassification` | array | Expenses classification overrides |

#### Income Classification Override

```json
{
  "incomeClassification": [
    {
      "classificationType": "E3_561_001",
      "classificationCategory": "category1_4"
    }
  ]
}
```

| Field | Type | Required | Description |
|---|---|---|---|
| `classificationType` | string | Optional | MyData income classification code (E3 format) |
| `classificationCategory` | string | Yes | Category like `category1_1`, `category1_4`, etc. |

#### Expenses Classification Override

```json
{
  "expensesClassification": [
    {
      "classificationType": "E3_102_001",
      "classificationCategory": "category2_1",
      "amount": 75.0,
      "vatAmount": 18.0,
      "vatCategory": 1,
      "vatExemptionCategory": 3,
      "id": 2
    }
  ]
}
```

| Field | Type | Required | Description |
|---|---|---|---|
| `classificationType` | string | Yes | MyData expenses classification code (E3 format) |
| `classificationCategory` | string | Yes | Category like `category2_1`, `category2_2`, etc. |
| `amount` | decimal | No | Specific amount for this categorization (defaults to net value) |
| `vatAmount` | decimal | No | VAT amount for this categorization |
| `vatCategory` | int | No | VAT category (1-10) for grouping in summary |
| `vatExemptionCategory` | int | No | VAT exemption code (1-31) if applicable |
| `id` | int | No | Optional unique identifier for the classification |

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
      "ftChargeItemCase": 5207048243932160026,
      "ftChargeItemCaseData": {
        "GR": {
          "mydataoverride": {
            "invoiceDetails": {
              "incomeClassification": [
                {
                  "classificationType": "E3_561_001",
                  "classificationCategory": "category1_7"
                }
              ]
            }
          }
        }
      }
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
            "invoiceType": "1.1",
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

## Income & Expense Classification Handling

### Overview

Income and expense classifications tell MyData how to categorize invoice line items for tax purposes. They can be:
1. **Automatically calculated** by the middleware from the receipt type
2. **Overridden** by providing explicit classification in `ftChargeItemCaseData`

### How Classifications Work

#### Income Classification (`incomeClassification`)

Used when the invoice records **revenue/income**:

- Applies to invoice types `1.1` through `2.4`, `11.x` (retail), etc.
- Each charge item can have **one income classification**
- Overriding clears any auto-detected classification
- Amount is automatically set to the net value of the line item

```json
{
  "cbChargeItems": [
    {
      "Amount": 100.0,
      "ftChargeItemCaseData": {
        "GR": {
          "mydataoverride": {
            "invoiceDetails": {
              "incomeClassification": [
                {
                  "classificationType": "E3_561_001",
                  "classificationCategory": "category1_4"
                }
              ]
            }
          }
        }
      }
    }
  ]
}
```

**Supported Income Classification Categories:**
- `category1_1` – Commodity/Goods Revenue
- `category1_2` – Product Revenue
- `category1_3` – Services Revenue
- `category1_4` – Fixed Asset Sales
- `category1_5` – Other Income/Profit
- `category1_6` – Self-Deliveries
- `category1_7` – Third-Party Sales (important for agency business)
- `category1_8` – Prior Year Income
- `category1_9` – Future Year Income
- `category1_10` – Income Adjustments
- `category1_95` – Other Income Info

#### Expenses Classification (`expensesClassification`)

Used when the invoice records **expenses/purchases**:

- Applies to invoice types `3.x`, `13.x`, `14.x`, etc.
- Each charge item can have **multiple expenses classifications**
- Useful when a single line item needs categorization across different expense types
- Supports granular VAT tracking per classification

```json
{
  "cbChargeItems": [
    {
      "Amount": 100.0,
      "ftChargeItemCaseData": {
        "GR": {
          "mydataoverride": {
            "invoiceDetails": {
              "expensesClassification": [
                {
                  "classificationType": "E3_102_001",
                  "classificationCategory": "category2_1",
                  "amount": 60.0,
                  "vatAmount": 14.4,
                  "vatCategory": 1
                },
                {
                  "classificationType": "E3_102_002",
                  "classificationCategory": "category2_2",
                  "amount": 40.0,
                  "vatAmount": 9.6,
                  "vatCategory": 1
                }
              ]
            }
          }
        }
      }
    }
  ]
}
```

**Supported Expenses Classification Categories:**
- `category2_1` through `category2_9` – Various expense types

### Invoice Type & Classification Relationship

The invoice type determines which classifications are allowed:

| Invoice Type | Classification Type | Notes |
|---|---|---|
| `1.1` - `2.4` (Sales/Service) | **Income** | Auto-detected from receipt type |
| `3.x` (Expenses) | **Expenses** | Allows multiple per line |
| `5.x` (Credit Memos) | **Income** | Can be positive or negative |
| `6.x` (Self-Delivery) | **Income** | Special case for internal transfers |
| `11.x` (Retail) | **Income** | POS receipts auto-classified |
| `13.x` (Expense Purchases) | **Expenses** | Split across SAC codes |
| `14.x` (Import/State Purchases) | **Expenses** | EU/Third-country specific |

### Automatic Summarization

The middleware **automatically aggregates** classifications in the invoice summary:

```
Invoice Summary:
├── incomeClassification[] → grouped by (category, type)
└── expensesClassification[] → grouped by (category, type, vatCategory, vatExemptionCategory)
```

**Example aggregation for expenses:**
```
Two line items with same classification:
  Line 1: amount=60, category=2_1, vatCat=1
  Line 2: amount=20, category=2_1, vatCat=1

Summary shows:
  amount=80, category=2_1, vatCat=1  (aggregated)
```

### Validation Rules

| Rule | Condition | Action |
|---|---|---|
| **Incompatible Classification** | Income override on expense invoice type | Error returned |
| **Expense override on income type** | Expense override on `1.x` invoice type | Error returned |
| **Invalid E3 Code** | Classification type doesn't exist in MyData | Error returned |
| **Invalid Category** | Classification category doesn't exist | Error returned |
| **Multiple Income Classifications** | More than one income classification per line | Error returned |
| **Amount Exceeds Line Net** | Expense amount > line item net value | Warning logged, used as-is |
| **Missing Category** | Classification provided without category | Error returned |

### Real-World Example: Magazine Expense Split

Split a €100 magazine purchase across two expense categories:

```json
{
  "ftReceiptCaseData": {
    "GR": {
      "mydataoverride": {
        "invoice": {
          "invoiceHeader": {
            "invoiceType": "1.1"
          }
        }
      }
    }
  },
  "cbChargeItems": [
    {
      "Amount": 100.0,
      "VATRate": 24,
      "Description": "Magazine Subscriptions",
      "ftChargeItemCaseData": {
        "GR": {
          "mydataoverride": {
            "invoiceDetails": {
              "expensesClassification": [
                {
                  "classificationType": "E3_205_001",
                  "classificationCategory": "category2_5",
                  "amount": 60.0,
                  "vatCategory": 1
                },
                {
                  "classificationType": "E3_205_002",
                  "classificationCategory": "category2_5",
                  "amount": 40.0,
                  "vatCategory": 1
                }
              ]
            }
          }
        }
      }
    }
  ]
}
```

---

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

### Example 5: Charge Item with Income Classification Override

Override the income classification for a specific line item:

```json
{
  "cbChargeItems": [
    {
      "Amount": 500.0,
      "Quantity": 1,
      "Description": "Consulting Services",
      "VATRate": 24,
      "ftChargeItemCase": 5207048243932160026,
      "ftChargeItemCaseData": {
        "GR": {
          "mydataoverride": {
            "invoiceDetails": {
              "incomeClassification": [
                {
                  "classificationType": "E3_561_001",
                  "classificationCategory": "category1_4"
                }
              ]
            }
          }
        }
      }
    }
  ],
  "ftReceiptCaseData": {
    "GR": {
      "mydataoverride": {
        "invoice": {
          "invoiceHeader": {
            "invoiceType": "2.1"
          }
        }
      }
    }
  }
}
```

**Result:**
- Invoice type forced to `2.1` (Service Invoice)
- Line item classified as `category1_4` (Fixed Asset Sales)
- Middleware skips auto-classification and uses override values

---

### Example 6: Split Expense Line (Multiple Classifications)

Single line item split across multiple expense categories:

```json
{
  "cbChargeItems": [
    {
      "Amount": 150.0,
      "VATRate": 24,
      "Description": "Office Supplies & Services",
      "ftChargeItemCaseData": {
        "GR": {
          "mydataoverride": {
            "invoiceDetails": {
              "expensesClassification": [
                {
                  "classificationType": "E3_102_001",
                  "classificationCategory": "category2_1",
                  "amount": 90.0,
                  "vatAmount": 21.6,
                  "vatCategory": 1
                },
                {
                  "classificationType": "E3_205_001",
                  "classificationCategory": "category2_5",
                  "amount": 60.0,
                  "vatAmount": 14.4,
                  "vatCategory": 1
                }
              ]
            }
          }
        }
      }
    }
  ]
}
```

**Result:**
- €150 purchase split: €90 (category2_1) + €60 (category2_5)
- Each gets own VAT tracking (21.6 + 14.4 = 36 total VAT)
- MyData summary aggregates both classifications

---

### Example 7: Invoice Type Override for Third-Party Sale

Mark invoice as third-party sale (agency/commission):

```json
{
  "cbChargeItems": [
    {
      "Amount": 1000.0,
      "Quantity": 1,
      "Description": "Electronics (sold on behalf of customer)",
      "VATRate": 24,
      "ftChargeItemCaseData": {
        "GR": {
          "mydataoverride": {
            "invoiceDetails": {
              "incomeClassification": [
                {
                  "classificationType": "E3_561_001",
                  "classificationCategory": "category1_7"
                }
              ]
            }
          }
        }
      }
    }
  ],
  "ftReceiptCaseData": {
    "GR": {
      "mydataoverride": {
        "invoice": {
          "invoiceHeader": {
            "invoiceType": "1.4",
            "thirdPartyCollection": true
          }
        }
      }
    }
  }
}
```

**Result:**
- Invoice type `1.4` (Intra-Community with Foreign VAT - for agency)
- Line classified as `category1_7` (Third-party sales)
- `thirdPartyCollection=true` indicates payment collected by intermediary

---

### Example 8: Restaurant Delivery Order (Complete Scenario)

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
