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

MyData field overrides can be embedded at **three different levels** in the ReceiptRequest:

#### 1. Receipt Level (`ftReceiptCaseData`)

```
ReceiptRequest
├── cbChargeItems[]
├── cbPayItems[]
├── cbCustomer
└── ftReceiptCaseData (JSON object)
    └── GR (Greece-specific data)
        └── mydataoverride (RECEIPT-LEVEL OVERRIDE CONTAINER)
            ├── invoice
            │   ├── invoiceHeader
            │   │   ├── dispatchDate
            │   │   ├── thirdPartyCollection
            │   │   ├── multipleConnectedMarks
            │   │   └── ... (other header fields)
            │   └── invoiceDetails[] (line item overrides)
            └── (future expansions)
```

#### 2. Charge Item Level (`ftChargeItemCaseData`)

Each charge item in `cbChargeItems[]` can have its own override:

```
cbChargeItems[]
└── []
    ├── Amount: 100.0
    ├── Description: "Product"
    ├── ftChargeItemCase: 5207048243932160026
    └── ftChargeItemCaseData (JSON object)
        └── GR (Greece-specific data)
            └── mydataoverride (CHARGE-ITEM-LEVEL OVERRIDE)
                └── invoiceDetails
                    ├── incomeClassification[]
                    └── expensesClassification[]
```

#### 3. Payment Item Level (`ftPayItemCaseData`)

Each payment item in `cbPayItems[]` can have its own override:

```
cbPayItems[]
└── []
    ├── Amount: 124.0
    ├── Description: "Cash Payment"
    ├── ftPayItemCase: 5207048243932160001
    └── ftPayItemCaseData (JSON object)
        └── GR (Greece-specific data)
            └── mydataoverride (PAYMENT-ITEM-LEVEL OVERRIDE)
                └── paymentMethodDetails
                    └── (payment classification overrides)
```

### Override Priority

When overrides exist at multiple levels, they are applied in this order:

1. **Payment Item Overrides** (`ftPayItemCaseData`) - Most specific
2. **Charge Item Overrides** (`ftChargeItemCaseData`) - Line item specific
3. **Receipt Level Overrides** (`ftReceiptCaseData`) - Invoice-level defaults

The more specific override takes precedence.

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

MyData supports the following invoice types (set via override). These are defined in AADE myDATA XSD v1.0.12:

##### Sales Invoices (1.x)

| Code | Description | Use Case |
|---|---|---|
| `1.1` | Sales Invoice | Standard domestic sales of goods |
| `1.2` | Sales Invoice - Intra-Community | Sales to EU VAT-registered buyers |
| `1.3` | Sales Invoice - Third Country | Sales to non-EU countries |
| `1.4` | Sales Invoice - Intra-Community with Foreign VAT | EU sales where VAT collected by recipient |
| `1.5` | Sales Invoice - Third Country with Foreign VAT | Non-EU sales with reverse charge |
| `1.6` | Sales Invoice - Supplementary | Additional/corrective invoice |

##### Service Invoices (2.x)

| Code | Description | Use Case |
|---|---|---|
| `2.1` | Service Invoice | Domestic services |
| `2.2` | Service Invoice - Intra-Community | EU service provision |
| `2.3` | Service Invoice - Third Country | Non-EU service provision |
| `2.4` | Service Invoice - Supplementary | Additional/corrective service invoice |

##### Proof of Expense (3.x)

| Code | Description | Use Case |
|---|---|---|
| `3.1` | Proof of Expense | Expense documentation |
| `3.2` | Proof of Expense - Intra-Community | EU cross-border expenses |

##### Credit Memos (5.x)

| Code | Description | Use Case |
|---|---|---|
| `5.1` | Credit Memo - Associated | Credit note for linked entity |
| `5.2` | Credit Memo - Non-Associated | Credit note for unrelated entity |

##### Self-Delivery (6.x)

| Code | Description | Use Case |
|---|---|---|
| `6.1` | Self-Delivery of Goods | Internal goods transfer |
| `6.2` | Self-Use of Services | Internal service usage |

##### Other Income Types (7.x - 8.x)

| Code | Description | Use Case |
|---|---|---|
| `7.1` | Contract Income | Contract-based revenue |
| `8.1` | Rent Invoice | Rental income invoicing |
| `8.2` | Rent Receipt | Rental payment receipt |
| `8.4` | Rent - Tax-Free Proof | Tax-exempt rent proof |
| `8.5` | Rent - Third-Party Proof | Rent collected by third party |

##### Retail Receipts (11.x)

| Code | Description | Use Case |
|---|---|---|
| `11.1` | Retail Sales Receipt | POS retail transaction |
| `11.2` | Service Receipt | Retail service transaction |
| `11.3` | Simplified Invoice | Simplified retail invoice |
| `11.4` | Retail Credit Note | Retail credit/refund |
| `11.5` | Retail Receipt - On Behalf of Third Party | Agency retail |

##### Expenses (13.x - 14.x)

| Code | Description | Use Case |
|---|---|---|
| `13.1` | Expenses - Retail Purchase | Retail expense purchase |
| `13.2` | Expenses - Retail Service | Retail expense service |
| `13.3` | Shared Expenses | Cost sharing arrangements |
| `13.4` | Subscriptions | Subscription expenses |
| `13.30` | Entity Receipts | Entity-specific receipts |
| `13.31` | Domestic/Foreign Sales on Behalf of Farmer | Farmer representation |
| `14.1` | Invoice - Intra-Community Acquisitions | EU purchases |
| `14.2` | Invoice - Third Country Acquisitions | Non-EU purchases |
| `14.3` | Invoice - Intra-Community Services Received | EU service received |
| `14.4` | Invoice - Third Country Services Received | Non-EU service received |
| `14.5` | EFKA and Insurance Organizations | Social security contributions |
| `14.30` | Entity Receipts and Documents | Entity documents |
| `14.31` | Domestic/Foreign Purchases Farmer | Farmer purchases |

##### Other Types (15.x - 17.x)

| Code | Description | Use Case |
|---|---|---|
| `15.1` | Contract Expense | Contract expenses |
| `16.1` | Rent Expense | Rental expenses |
| `17.1` | Payroll | Payroll costs |
| `17.2` | Depreciation | Depreciation expenses |
| `17.3` | Other Income Adjustment Entries | Income adjustments |
| `17.4` | Other Income Adjustment Entries (Foreign Entity) | Foreign income adjustments |
| `17.5` | Other Expense Adjustment Entries | Expense adjustments |
| `17.6` | Other Expense Adjustment Entries (Foreign Entity) | Foreign expense adjustments |

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

### Payment Item Level Overrides

Override individual payment items within the invoice via `ftPayItemCaseData`:

```json
{
  "cbPayItems": [
    {
      "Amount": 124.0,
      "Description": "Cash Payment",
      "ftPayItemCase": 5207048243932160001,
      "ftPayItemCaseData": {
        "GR": {
          "mydataoverride": {
            "paymentMethodDetails": {
              "paymentMethodType": 3,
              "paymentMethodInfo": "POS Terminal ID: 12345"
            }
          }
        }
      }
    }
  ]
}
```

#### Payment Method Detail Fields

| Field Name | Type | Description | Example |
|---|---|---|---|
| `paymentMethodType` | int | Payment method type (1-8) | `3` |
| `paymentMethodInfo` | string | Additional payment info | `"POS Terminal ID: 12345"` |
| `tipAmount` | decimal | Tip amount (for card payments) | `5.00` |
| `transactionId` | string | Transaction reference | `"TXN-2025-001"` |
| `tid` | string | Terminal ID | `"TERM-001"` |

#### ftPayItemCase Values (Payment Type Codes)

The `ftPayItemCase` field determines the payment type. The following values are supported for MyData integration:

| ftPayItemCase | Description | MyData Code | Notes |
|---|---|---|---|
| `5207048243932160001` | Cash Payment | 3 | Standard cash |
| `5207048243932160002` | Cheque | 4 | Cheque payment |
| `5207048243932160003` | Credit Card | 5 | Credit card |
| `5207048243932160004` | Debit Card | 4 | Debit card (maps to 4 in MyData) |
| `5207048243932160005` | Voucher (Coupon) | 6 | Gift voucher/value voucher |
| `5207048243932160006` | Web Banking | 6 | Online payment |
| `5207048243932160007` | Loyalty Card | 8 | Customer loyalty program |
| `5207048243932160008` | Accounts Receivable | 5 | On credit/postpaid |
| `5207048243932160009` | IRIS Payment | 8 | IRIS system payment |
| `5207048243932160010` | Bank Transfer Domestic | 1 | Domestic wire transfer |
| `5207048243932160011` | Bank Transfer International | 2 | International wire |
| `5207048243932160012` | Crypto Currency | 6 | Cryptocurrency payment |
| `5207048243932160013` | Contactless Payment | 4 | NFC/Contactless |
| `5207048243932160014` | Mobile Payment | 6 | Apple Pay/Google Pay |
| `5207048243932160015` | Split Payment | 4+5 | Multiple payment methods |
| `5207048243932160016` | Installment Payment | 5 | Payment in installments |
| `5207048243932160017` | Prepaid Card | 6 | Prepaid card payment |
| `5207048243932160018` | Food Voucher | 6 | Meal/food voucher |
| `5207048243932160019` | Fuel Voucher | 6 | Fuel card |
| `5207048243932160020` | Corporate Card | 5 | Business credit card |

> **Note:** The MyData column shows the corresponding payment method code (1-8) that will be sent to the Greek tax authority. Some ftPayItemCase values map to the same MyData code.

#### Payment Item Override JSON Structure

```json
{
  "ftPayItemCaseData": {
    "GR": {
      "mydataoverride": {
        "paymentMethodDetails": {
          "paymentMethodType": 3,
          "paymentMethodInfo": "Additional payment information",
          "tipAmount": 0.00,
          "transactionId": "optional-transaction-id",
          "tid": "terminal-id"
        }
      }
    }
  }
}
```

**Field Descriptions:**

| Field | Type | Required | Description |
|---|---|---|---|
| `paymentMethodType` | int | Yes | MyData payment method (1-8) |
| `paymentMethodInfo` | string | No | Free-form text for additional info |
| `tipAmount` | decimal | No | Tip amount (typically for card payments) |
| `transactionId` | string | No | External transaction reference |
| `tid` | string | No | Terminal/device identifier |

---

## Complete Enum Value Reference

This section provides comprehensive lists of all available values for MyData field overrides.

### VAT Category Types (1-10)

Used in `vatCategory` field for classification grouping:

| Code | Description | Rate |
|---|---|---|
| `1` | Rate 24% | Standard VAT rate |
| `2` | Rate 13% | Reduced VAT rate |
| `3` | Rate 6% | Super-reduced VAT rate |
| `4` | Rate 17% | Intermediate VAT rate |
| `5` | Rate 9% | Special reduced rate |
| `6` | Rate 4% | Special rate for essential goods |
| `7` | Zero Rate | Zero VAT (exempt with zero rate) |
| `8` | Not Subject to VAT | Outside VAT scope |
| `9` | Rate 3% | Special minimum rate |
| `10` | Rate 0% (Special Regime) | Special regime rate |

### VAT Exemption Types (1-31)

Used in `vatExemptionCategory` field when VAT is not applicable:

| Code | Description | Legal Reference |
|---|---|---|
| `1` | No VAT - Article 3 | Article 3 of VAT Code |
| `2` | No VAT - Article 5 | Article 5 of VAT Code |
| `3` | No VAT - Article 13 | Article 13 of VAT Code |
| `4` | No VAT - Article 14 | Article 14 of VAT Code |
| `5` | No VAT - Article 16 | Article 16 of VAT Code |
| `6` | No VAT - Article 19 | Article 19 of VAT Code |
| `7` | No VAT - Article 22 | Article 22 of VAT Code |
| `8` | No VAT - Article 24 | Article 24 of VAT Code |
| `9` | No VAT - Article 25 | Article 25 of VAT Code |
| `10` | No VAT - Article 26 | Article 26 of VAT Code |
| `11` | No VAT - Article 27 | Article 27 of VAT Code |
| `12` | No VAT - Article 27 (Open Seas) | Article 27 - Open seas |
| `13` | No VAT - Article 27.1 | Article 27 paragraph 1 |
| `14` | No VAT - Article 36 | Article 36 of VAT Code |
| `15` | No VAT - Article 39a | Article 39a of VAT Code |
| `16` | No VAT - Article 39b | Article 39b of VAT Code |
| `17` | No VAT - Article 40 | Article 40 of VAT Code |
| `18` | No VAT - Article 41 | Article 41 of VAT Code |
| `19` | No VAT - Article 47 | Article 47 of VAT Code |
| `20` | No VAT - Pol 1029/1995 | Policy 1029/1995 |
| `21` | No VAT - Pol 1167/2015 | Policy 1167/2015 |
| `22` | No VAT - Other Exemptions | Other exemption cases |
| `23` | No VAT - Article 43 | Article 43 of VAT Code |
| `24` | No VAT - Article 44 | Article 44 of VAT Code |
| `25` | No VAT - Article 45 | Article 45 of VAT Code |
| `26` | No VAT - Article 46 | Article 46 of VAT Code |
| `27` | No VAT - Merge Scheme | Mergers and acquisitions |
| `28` | No VAT - Article 6 | Article 6 of VAT Code |
| `29` | No VAT - Pol 1137/2018 | Policy 1137/2018 |
| `30` | No VAT - Other Exemptions 2 | Additional exemptions |
| `31` | No VAT - IC Triangular Arrangement | Triangular intra-community |

### Payment Method Types (1-8)

Used in payment method classification:

| Code | Description | MyData Mapping |
|---|---|---|
| `1` | Domestic Payment Account | Domestic bank transfer |
| `2` | International Payment Account | International wire |
| `3` | Cash | Cash payment |
| `4` | Cheque | Cheque payment |
| `5` | On Credit | Credit/Postpaid |
| `6` | Web Banking | Online banking |
| `7` | POS | Card terminal |
| `8` | IRIS | IRIS payment system |

### Withholding Tax Categories (1-18)

Used for tax withholding on payments:

| Code | Description |
|---|---|
| `1` | Interest, Dividend, Rights |
| `2` | Royalties, Technical Assistance |
| `3` | Management Advisory Fees |
| `4` | Technical Works |
| `5` | Fluid Fuels, Other Goods |
| `6` | Products and Services |
| `7` | Architects, Engineers, Other Services |
| `8` | Management Advisory Fees 2 |
| `9` | Architects, Engineers, Other Services 2 |
| `10` | Lawyers |
| `11` | Payroll and Pensions |
| `12` | Compensations |
| `13` | Special Compensation |
| `14` | Insurance Premiums |
| `15` | Medical Expenses |
| `16` | Pension Contributions |
| `17` | Social Security |
| `18` | Other Withholding |

### Stamp Duty Categories (1-4)

Used for stamp duty calculations:

| Code | Description |
|---|---|
| `1` | Stamp Duty 2% |
| `2` | Stamp Duty 3% |
| `3` | Stamp Duty 4% |
| `4` | Fixed Amount |

### Fee Categories (1-22)

Used for additional fees on line items:

| Code | Description |
|---|---|
| `1` | Shipping Fee |
| `2` | Packaging Fee |
| `3` | Insurance Fee |
| `4` | Installation Fee |
| `5` | Training Fee |
| `6` | Maintenance Fee |
| `7` | Consultation Fee |
| `8` | Documentation Fee |
| `9` | Brokerage Fee |
| `10` | Commission |
| `11` | Rental Fee |
| `12` | License Fee |
| `13` | Environmental Fee |
| `14` | Plastic Bag Fee |
| `15` | Recycling Fee |
| `16` | Accommodation Stay Fee |
| `17` | Accommodation Stay Fee (Room/Apartment) |
| `18` | Cafeteria/Restaurant Fee |
| `19` | Casino Fee |
| `20` | TV Subscription 10% |
| `21` | Green Fee |
| `22` | Other Fees |

### Other Taxes Categories (1-30)

Used for other tax types:

| Code | Description |
|---|---|
| `1` | Withholding Tax |
| `2` | Stamp Duty |
| `3` | Fees |
| `4` | Other Taxes |
| `5` | Deductions |
| `6` | Municipal Tax |
| `7` | Fire Insurance 10% |
| `8` | Fire Insurance 15% Intra |
| `9` | Fire Insurance 15% Third |
| `10` | Luxury Tax 5% |
| `11` | Luxury Tax 10% |
| `12` | Luxury Tax 20% |
| `13` | Luxury Tax 10% (Intra) |
| `14` | Luxury Tax 15% (Intra) |
| `15` | Luxury Tax 15% (Third Country) |
| `16` | Casino Ticket Fee |
| `17` | Fire Insurance Premium 20% |
| `18` | Customs Duties |
| `19` | Other Customs Duties |
| `20` | Charitable Duty on Imports |
| `21` | Other Taxes |
| `22` | Special Consumption Tax |
| `23` | Social Solidarity Contribution |
| `24` | Excise Duty on Coffee |
| `25` | Excise Duty on Electronic Cigarette |
| `26` | Environmental Protection Fee |
| `27` | Insurance Contribution Charge |
| `28` | Excise Duty on Energy |
| `29` | Developmental Surcharge |
| `30` | Other Taxes and Duties |

### Income Classification Categories

Used in `classificationCategory` for income classification:

| Code | Description |
|---|---|
| `category1_1` | Commodity Sale Income |
| `category1_2` | Product Sale Income |
| `category1_3` | Provision of Services Income |
| `category1_4` | Sale of Fixed Assets Income |
| `category1_5` | Other Income/Profits |
| `category1_6` | Self-Deliveries/Self-Supplies |
| `category1_7` | Income on behalf of Third Parties |
| `category1_8` | Past fiscal years income |
| `category1_9` | Future fiscal years income |
| `category1_10` | Other Income Adjustment/Regularisation |
| `category1_95` | Other Income-related Information |
| `category3` | Delivery |

### Expenses Classification Categories

Used in `classificationCategory` for expenses classification:

| Code | Description |
|---|---|
| `category2_1` | Purchase of Goods |
| `category2_2` | Purchase of Products |
| `category2_3` | Expenses for Services |
| `category2_4` | Purchase of Fixed Assets |
| `category2_5` | Other Expenses/_losses |
| `category2_6` | Expenses on behalf of Third Parties |
| `category2_7` | Past fiscal years expenses |
| `category2_8` | Future fiscal years expenses |
| `category2_9` | Other Expense Adjustments |
| `category2_10` | Depreciation |
| `category2_11` | Personnel Expenses |
| `category2_12` | Rental Expenses |
| `category2_13` | Third Party Expenses |
| `category2_14` | Financial Expenses |
| `category2_95` | Other Expense Information |

### Income Classification Value Types (E3 Codes)

Used in `classificationType` for income classification:

| Code | Description |
|---|---|
| `E3_106_001` through `E3_106_009` | Self-Production of Fixed Assets |
| `E3_205_001` through `E3_205_009` | Self-Production Materials |
| `E3_207` | Self-Production Products |
| `E3_210` | Self-Production in Progress |
| `E3_305_001` through `E3_305_009` | Self-Delivery Raw Materials |
| `E3_313` | Self-Delivery Products |
| `E3_561_001` through `E3_561_003` | Wholesale Sales |
| `E3_562_001` through `E3_562_003` | Retail Sales |
| `E3_563_001` through `E3_563_003` | Intra-Community Sales |
| `E3_564_001` through `E3_564_003` | Third Country Sales |
| `E3_565_001` through `E3_565_003` | Sales on behalf of Third Parties |
| `E3_566` | Services Revenue |
| `E3_567` | Profits from Reversal of Provisions |
| `E3_568` | Profits from Fair Value Measurement |
| `E3_570` | Extraordinary income |
| `E3_595` | Self-Production Expenses |
| `E3_596` | Subsidies - Grants |
| `E3_597` | Subsidies for Investment |
| `E3_581_001` through `E3_581_003` | Other Income |
| `E3_582` through `E3_589` | Various Income Types |
| `E3_880_001` through `E3_880_004` | Fixed Asset Sales |
| `E3_881_001` through `E3_881_004` | Sales on behalf of Third Parties |

### Expenses Classification Value Types (E3 Codes)

Used in `classificationType` for expenses classification:

| Code | Description |
|---|---|
| `E3_101` | Purchase of Goods |
| `E3_102_001` through `E3_102_006` | Purchase of Products |
| `E3_104` | Materials |
| `E3_201` | Expenses for Services |
| `E3_202_001` through `E3_202_005` | Various Service Expenses |
| `E3_204` | Other Service Expenses |
| `E3_207` | Professional Fees |
| `E3_209` | Other Fees |
| `E3_301` | Purchase of Fixed Assets |
| `E3_302_001` through `E3_302_005` | Fixed Asset Purchases |
| `E3_304` | Other Fixed Assets |
| `E3_307` | Depreciation |
| `E3_309` | Personnel Expenses |
| `E3_312` | Rental Expenses |
| `E3_313` | Third Party Expenses |
| `E3_315` | Financial Expenses |
| `E3_581_001` through `E3_581_003` | Other Expenses |
| `E3_582` through `E3_589` | Various Expense Types |
| `E3_585_001` through `E3_585_016` | Specific Expense Categories |
| `E3_881_001` through `E3_884_004` | Third Party Transactions |
| `VAT_361` through `VAT_366` | VAT Related |
| `NOT_VAT_295` | Non-VAT Items |

### Special Invoice Categories (1-13)

Used in `specialInvoiceCategory` for special invoice types:

| Code | Description |
|---|---|
| `1` | Subsidies |
| `2` | Hotel Retail Revenue |
| `3` | Accounting Entry |
| `4` | Tax Free |
| `5` | Complex Transactions |
| `6` | Article Mon Prot |
| `7` | Seller on His Behalf |
| `8` | Invoice for Sale on Behalf |
| `9` | Invoice for Sale on Behalf of Third Party |
| `10` | Due to Third Party Receipts |
| `11` | Invoice for Third Party Service |
| `12` | Invoice for Third Party Service 2 |
| `13` | Transition Adjustment |

### Invoice Variation Types (1-4)

Used in `invoiceVariationType`:

| Code | Description |
|---|---|
| `1` | Quote or Proposal |
| `2` | Goods Delivery or Received |
| `3` | Returns of Goods or Refusal of Service |
| `4` | Payments in Advance |

### Move Purpose Types (1-20)

Used in `movePurpose` for delivery notes:

| Code | Description |
|---|---|
| `1` | Sale |
| `2` | Third Party Sales |
| `3` | Sampling |
| `4` | Exhibition |
| `5` | Return |
| `6` | Storage |
| `7` | Processing |
| `8` | Between Facilities |
| `9` | Internal Use |
| `10` | Transfer |
| `11` | Other |
| `12` through `20` | Additional purposes |

### Measurement Unit Types (1-7)

Used in `measurementUnit`:

| Code | Description |
|---|---|
| `1` | Pieces |
| `2` | Kilograms |
| `3` | Liters |
| `4` | Meters |
| `5` | Square Meters |
| `6` | Cubic Meters |
| `7` | Items |

### Line Record Types (1-7)

Used in `recType`:

| Code | Description |
|---|---|
| `1` | Normal |
| `2` | VAT Regime Excluded |
| `3` | Negative Sign |
| `4` | Information Only |
| `5` | VAT Inclusive |
| `6` | Negative Sign Without VAT |
| `7` | Negative Sign VAT Inclusive |

### Invoice Detail Types (1-2)

Used in `invoiceDetailType`:

| Code | Description |
|---|---|
| `1` | Clear Line Item |
| `2` | VAT Included Line Item |

### Tax Types (1-5)

Used in `taxType` for summary:

| Code | Description |
|---|---|
| `1` | Withheld Tax |
| `2` | Stamp Duty |
| `3` | Fees |
| `4` | Other Taxes |
| `5` | Deductions |

### Entity Category Types (1-6)

Used in `entityType` for related parties:

| Code | Description |
|---|---|
| `1` | Tax Representative |
| `2` | Intermediary |
| `3` | Shipper |
| `4` | Bill of Lading Recipient |
| `5` | Dispatcher |
| `6` | Transport Company |

### Transaction Mode Types (0-1)

Used in `transactionMode`:

| Code | Description |
|---|---|
| `0` | Rejection |
| `1` | Acceptance |

### Classification Post Mode Types (0-1)

Used in `classificationPostMode`:

| Code | Description |
|---|---|
| `0` | Replace All |
| `1` | Append to Existing |

### Reverse Delivery Note Purpose Types (1-5)

Used in `reverseDeliveryNotePurpose`:

| Code | Description |
|---|---|
| `1` | Rejection by Receiver |
| `2` | Return to Sender |
| `3` | Wrong Delivery |
| `4` | Surplus Inventory |
| `5` | Other |

### Transmission Failure Types (1-4)

Used in `transmissionFailure`:

| Code | Description |
|---|---|
| `1` | Network Failure |
| `2` | Technical Failure |
| `3` | Provider Network Failure |
| `4` | Provider Technical Failure |

### Fuel Codes

Used in `fuelCode` for fuel items:

| Code | Description |
|---|---|
| `1` | Gasoline 95 |
| `2` | Gasoline 98 |
| `3` | Diesel |
| `4` | LPG |
| `5` | Natural Gas |
| `6` | Kerosene |
| `7` | Heating Oil |
| `8` | Other Fuel |

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
