# How to Override Greek MyData Fields in fiskaltrust ReceiptRequest

## Overview

The fiskaltrust GR middleware lets you override Greek MyData fields directly from a `ReceiptRequest` by embedding override JSON in the case-data of the receipt or its charge items. This guide describes **what you can override**, **where to put it in the JSON**, and **how the middleware reacts** to invalid input.

---

## Table of Contents

1. [Where Overrides Live](#where-overrides-live)
2. [Receipt-Level Overrides](#receipt-level-overrides)
3. [Charge-Item-Level Overrides](#charge-item-level-overrides)
4. [Pay-Item-Level Overrides](#pay-item-level-overrides)
5. [Fields That Cannot Be Overridden](#fields-that-cannot-be-overridden)
6. [Validation Behavior](#validation-behavior)
7. [Examples](#examples)

---

## Where Overrides Live

There are **two** override channels:

```
ReceiptRequest
├── ftReceiptCaseData                       ← receipt-level overrides
│   └── GR
│       └── mydataoverride
│           └── invoice
│               ├── counterpart
│               ├── invoiceHeader
│               └── otherTransportDetails[]
│
└── cbChargeItems[]
    └── ftChargeItemCaseData                ← per-line overrides
        └── GR
            └── mydataoverride
                └── invoiceDetails
```

**Property names are case-insensitive** (`mydataoverride`, `MyDataOverride`, `MYDATAOVERRIDE` all work). Receipt-level and charge-item-level overrides apply independently.

---

## Receipt-Level Overrides

Set on `ReceiptRequest.ftReceiptCaseData`:

```json
{
  "GR": {
    "mydataoverride": {
      "invoice": {
        "counterpart": { /* PartyType override */ },
        "invoiceHeader": { /* InvoiceHeader override */ },
        "otherTransportDetails": [
          { "vehicleNumber": "ABC-1234" }
        ]
      }
    }
  }
}
```

### `invoiceHeader` fields

| Field | Type | Notes |
|---|---|---|
| `invoiceType` | string | One of `1.1`, `1.2`, ..., `17.6`. Invalid values are rejected. |
| `vatPaymentSuspension` | bool | |
| `selfPricing` | bool | |
| `dispatchDate` | string (ISO 8601 date) | |
| `dispatchTime` | string (ISO 8601 datetime) | |
| `vehicleNumber` | string | |
| `movePurpose` | int | AADE move-purpose code. |
| `fuelInvoice` | bool | |
| `specialInvoiceCategory` | int | |
| `invoiceVariationType` | int | |
| `otherCorrelatedEntities` | array | See [Entity override](#entity-override). |
| `otherDeliveryNoteHeader` | object | See [Delivery note header](#delivery-note-header). |
| `otherMovePurposeTitle` | string | |
| `exchangeRate` | decimal | |
| `thirdPartyCollection` | bool | |
| `totalCancelDeliveryOrders` | bool | |
| `reverseDeliveryNote` | bool | |
| `reverseDeliveryNotePurpose` | int | **Required** when `invoiceType=9.3` and `reverseDeliveryNote=true`. |

### Delivery note header

`otherDeliveryNoteHeader` is an object with these fields:

```json
{
  "otherDeliveryNoteHeader": {
    "loadingAddress": {
      "street": "Παγκρατίου",
      "number": "45",
      "postalCode": "54623",
      "city": "Θεσσαλονίκη"
    },
    "deliveryAddress": {
      "street": "Κηφισίας",
      "number": "12",
      "postalCode": "15124",
      "city": "Αθήνα"
    },
    "startShippingBranch": 1,
    "completeShippingBranch": 2
  }
}
```

`loadingAddress` and `deliveryAddress` accept `street`, `number`, `postalCode`, and `city`.

### Entity override

`otherCorrelatedEntities[]`:

```json
{
  "otherCorrelatedEntities": [
    {
      "type": 1,
      "entityData": {
        /* PartyType override */
      }
    }
  ]
}
```

### `counterpart`

Only the unmapped party fields are overridable (the standard counterpart fields come from `cbCustomer`):

```json
{
  "counterpart": {
    "branch": 0,
    "documentIdNo": "GR-DOC-001",
    "supplyAccountNo": "ACC-9999",
    "countryDocumentId": "GR",
    "address": {
      "street": "...",
      "number": "...",
      "postalCode": "...",
      "city": "..."
    }
  }
}
```

`countryDocumentId` must be a valid ISO country code; unknown values are silently ignored.

### `otherTransportDetails`

```json
{
  "otherTransportDetails": [
    { "vehicleNumber": "ABC-1234" }
  ]
}
```

---

## Charge-Item-Level Overrides

Set on each `ChargeItem.ftChargeItemCaseData`:

```json
{
  "GR": {
    "mydataoverride": {
      "invoiceDetails": {
        /* line-level override */
      }
    }
  }
}
```

### Identifiers / descriptors

| Field | Type | Notes |
|---|---|---|
| `lineNumber` | int | Otherwise auto-assigned. |
| `taricNo` | string | |
| `itemCode` | string | |
| `itemDescr` | string | Defaults to the charge item's `Description`. |
| `lineComments` | string | |
| `recType` | int | |
| `fuelCode` | int | |
| `invoiceDetailType` | int | |
| `discountOption` | bool | |
| `notVAT195` | bool | |

### Quantities and units

| Field | Type | Notes |
|---|---|---|
| `quantity` | decimal | Defaults to `chargeItem.Quantity`. |
| `quantity15` | decimal | |
| `measurementUnit` | int | Otherwise mapped from the charge item. |
| `otherMeasurementUnitQuantity` | int | |
| `otherMeasurementUnitTitle` | string | |

### VAT classification

| Field | Type | Notes |
|---|---|---|
| `vatCategory` | int | |
| `vatExemptionCategory` | int | |

### Special-tax fields

| Field | Type | Notes |
|---|---|---|
| `withheldAmount` | decimal | |
| `withheldPercentCategory` | int | |
| `stampDutyAmount` | decimal | |
| `stampDutyPercentCategory` | int | |
| `feesAmount` | decimal | |
| `feesPercentCategory` | int | |
| `otherTaxesAmount` | decimal | |
| `otherTaxesPercentCategory` | int | |
| `deductionsAmount` | decimal | |

### `dienergia` (ship type)

```json
{
  "dienergia": {
    "applicationId": "APP-001",
    "applicationDate": "2025-06-20",
    "doy": "1101",
    "shipId": "SHIP-XYZ"
  }
}
```

### `incomeClassification` (single entry, type/category only)

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

Rules:
- The array must contain **exactly one** element.
- `classificationType` must be a valid AADE income-classification code; invalid values are rejected with a list of allowed names.
- `classificationCategory` must be a valid category; invalid values are rejected.
- `amount` is not overridable here — it is taken from the line's net value.
- If a classification override is set on **any** charge item, it must be set on **every** charge item, **and** `invoiceType` must also be overridden. Mixed-state requests are rejected.

### `expensesClassification` (multiple entries supported)

```json
{
  "expensesClassification": [
    {
      "classificationType": "E3_102_001",
      "classificationCategory": "category2_1",
      "amount": 60.0,
      "vatAmount": 14.4,
      "vatCategory": 1,
      "vatExemptionCategory": 3,
      "id": 2
    }
  ]
}
```

Rules:
- `classificationType` and `classificationCategory` are validated; invalid values are rejected.
- `amount` defaults to the line's net value if omitted.
- Setting an `expensesClassification` override clears any `incomeClassification` on the same line.

---

## Pay-Item-Level Overrides

**Not supported.** There is no MyData override channel on `cbPayItems[*].ftPayItemCaseData`. Payment methods sent to AADE are derived from `ftPayItemCase` and `cbPayItems[*].Description`.

If you need to influence the transmitted payment data, set the appropriate Greek `ftPayItemCase` value on the pay item — there is no JSON override channel for payments today.

---

## Fields That Cannot Be Overridden

These fields have no override channel:

| Field | Reason |
|---|---|
| `uid`, `mark`, `cancelledByMark`, `authenticationCode`, `transmissionFailure` | Populated by AADE in the response |
| `paymentMethods[]` | Built from `cbPayItems` |
| `taxesTotals[]` | Aggregated from line items |
| `invoiceSummary` | Aggregated from line items |
| `qrCodeUrl`, `downloadingInvoiceUrl` | Built from the receipt URL |
| `issuer` | Comes from configured master data |

---

## Validation Behavior

The middleware does **not** silently swallow malformed overrides. When validation fails, `MapToInvoicesDoc` returns no document and the error includes the offending value and (where applicable) the list of allowed values.

| Scenario | Behavior |
|---|---|
| Unknown `invoiceType` | Rejected; error lists allowed values. |
| Unknown `classificationType` (income or expenses) | Rejected; error lists allowed values. |
| Unknown `classificationCategory` (income or expenses) | Rejected; error lists allowed values. |
| Unknown `countryDocumentId` on a party override | Silently ignored. |
| `incomeClassification` array with more than one entry, or zero entries | Rejected. |
| Classification override set on some charge items but not all | Rejected. |
| Classification override set without an `invoiceType` override | Rejected. |
| `invoiceType=9.3` + `reverseDeliveryNote=true` without `reverseDeliveryNotePurpose` | Rejected. |
| Malformed JSON in `ftChargeItemCaseData` / `ftReceiptCaseData` | The override is skipped silently — the same case-data envelope is also used to carry non-MyData payloads (e.g. payment-provider data), so unrecognized JSON cannot block the receipt. |
| Unknown JSON properties inside a valid override | Ignored. |

The takeaway: **unknown properties don't break anything**, but invalid values for known typed fields are strict — fix the value or omit the field.

---

## Examples

### Override only the dispatch date

```json
{
  "ftReceiptCaseData": {
    "GR": {
      "mydataoverride": {
        "invoice": {
          "invoiceHeader": { "dispatchDate": "2025-06-19" }
        }
      }
    }
  }
}
```

### Force the invoice type

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
  }
}
```

### Delivery note details (loading + delivery address)

```json
{
  "ftReceiptCaseData": {
    "GR": {
      "mydataoverride": {
        "invoice": {
          "invoiceHeader": {
            "dispatchDate": "2025-06-20",
            "dispatchTime": "2025-06-20T14:30:00Z",
            "otherDeliveryNoteHeader": {
              "loadingAddress": {
                "street": "Πατησίων",
                "number": "1",
                "postalCode": "10434",
                "city": "Αθήνα"
              },
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
}
```

### Income classification override on a single line

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

### Expenses classification — single line split across categories

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

### Line-level special-tax fields (`recType` + `feesPercentCategory`)

```json
{
  "Quantity": 1,
  "Description": "Περιβαλλοντικό Τέλος & πλαστικής σακούλας ν. 2339/2001 αρ. 6α 0,07 ευρώ ανά τεμάχιο",
  "Amount": 0.07,
  "VATRate": 24,
  "ftChargeItemCase": 35184372089075,
  "ftChargeItemCaseData": {
    "GR": {
      "mydataoverride": {
        "invoiceDetails": {
          "recType": 2,
          "feesPercentCategory": 8
        }
      }
    }
  }
}
```

---

**Last Updated:** 2026-05-08
