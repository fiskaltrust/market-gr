# Finished

## Payment Type

| Middleware Payment Type | mydata Payment Method |
|---|---|
| UnknownPaymentType - 0 | Cash - 3 |
| CashPayment - 1 | Cash - 3 |
| NonCash - 2 | NOT SUPPORTED |
| CrossedCheque - 3 | Check - 4 |
| DebitCardPayment - 4 | PosEPos - 7 |
| CreditCardPayment - 5 | PosEPos - 7 |
| VoucherPaymentCouponVoucherByMoneyValue - 6 | Check - 4 |
| OnlinePayment - 7 | NOT SUPPORTED |
| LoyaltyProgramCustomerCardPayment - 8 | NOT SUPPORTED |
| AccountsReceivable - 9 | OnCredit - 5 |
| SEPATransfer - 0A | if Payment Description = "IRIS" => IrisDirectPayments - 8<br/> if PayItem.Description == "RF code payment (Web banking)" => Web Banking - 6 <br/> Domestic Payments Account Number - 1 |
| OtherBankTransfer - 0B | Foreign Payments Account Number - 2 |
| TransferToCashbookVaultOwnerEmployee - 0C | NOT SUPPORTED |
| InternalMaterialConsumption - 0D | NOT SUPPORTED |
| Grant - 0E | NOT SUPPORTED |
| TicketRestaurant - 0F | NOT SUPPORTED |

# In Progress
## VAT Category

| Middleware VAT Category | mydata VAT Category |
|---|---|
| UnknownVatRate - 0 | ? |
| DiscountedVatRate1 - 1 | VatRate13 - 2 |
| DiscountedVatRate2 - 2 | VatRate6 - 3 |
| NormalVatRate - 3 | VatRate24 - 1 |
| SuperReducedVatRate1 - 4 | VatRate17 - 4 |
| SuperReducedVatRate2 - 5 | VatRate9 - 5 |
| ParkingVatRate - 6 | VatRate4 - 6 |
| ZeroVatRate - 7 | ExcludingVat - 7 |
| NotTaxable - 8 | RegistrationsWithoutVat - 8 |
| ? | VAT rate 3% (Article 31, Law 5057/2023) - 9 |
| ? | VAT rate 4% (Article 31, Law 5057/2023) - 10 |

## Income Category

| Code | Description | Category |
|---|---|---|
| category1_1 | Commodity Sale Income (+)/(-) | 75 myDATA REST API |
| category1_2 | Product Sale Income (+)/(-) | |
| category1_3 | Provision of Services Income (+)/(-) | |
| category1_4 | Sale of Fixed Assets Income (+)/(-) | |
| category1_5 | Other Income/Profits (+)/(-) | |
| category1_6 | Self-Deliveries/Self-Supplies (+)/(-) | |
| category1_7 | Income on behalf of Third Parties (+)/(-) | |
| category1_8 | Past fiscal years income (+)/(-) | |
| category1_9 | Future fiscal years income (+)/(-) | |
| category1_10 | Other Income Adjustment/Regularisation Entries (+)/(-) | |
| category1_95 | Other Income-related Information (+)/(-) | |
| category3 | Delivery | |

## Income Classification

| Code       | Description                                                                                                   |
|------------|---------------------------------------------------------------------------------------------------------------|
| E3_106     | Self-Production of Fixed Assets – Self-Deliveries – Destroying inventory/Commodities                          |
| E3_205     | Self-Production of Fixed Assets – Self-Deliveries – Destroying inventory/Raw and other materials              |
| E3_210     | Self-Production of Fixed Assets – Self-Deliveries – Destroying inventory/Products and production in progress  |
| E3_305     | Self-Production of Fixed Assets – Self-Deliveries – Destroying inventory/Raw and other materials              |
| E3_310     | Self-Production of Fixed Assets – Self-Deliveries – Destroying inventory/ Products and production in progress |
| E3_318     | Self-Production of Fixed Assets – Self-Deliveries – Destroying inventory/Production expenses                  |
| E3_561_001 | Wholesale Sales of Goods and Services – for Traders                                                           |
| E3_561_002 | Wholesale Sales of Goods and Services pursuant to article 39a paragraph 5 of the VAT Code (Law 2859/2000)     |
| E3_561_003 | Retail Sales of Goods and Services – Private Clientele                                                        |
| E3_561_004 | Retail Sales of Goods and Services pursuant to article 39a paragraph 5 of the VAT Code (Law 2859/2000)        |
| E3_561_005 | Intra-Community Foreign Sales of Goods and Services                                                           |
| E3_561_006 | Third Country Foreign Sales of Goods and Services                                                             |
| E3_561_007 | Other Sales of Goods and Services                                                                             |
| E3_562     | Other Ordinary Income                                                                                         |
| E3_563     | Credit Interest and Related Income                                                                            |
| E3_564     | Credit Exchange Differences                                                                                   |
| E3_565     | Income from Participations                                                                                    |
| E3_566     | Profits from Disposing Non-Current Assets                                                                     |
| E3_567     | Profits from the Reversal of Provisions and Impairments                                                       |
| E3_568     | Profits from Measurement at Fair Value                                                                        |
| E3_570     | Extraordinary income and profits                                                                              |
| E3_595     | Self-Production Expenses                                                                                      |
| E3_596     | Subsidies - Grants                                                                                            |
| E3_597     | Subsidies – Grants for Investment Purposes – Expense Coverage                                                 |
| E3_880_001 | Wholesale Sales of Fixed Assets                                                                               |
| E3_880_002 | Retail Sales of Fixed Assets                                                                                  |
| E3_880_003 | Intra-Community Foreign Sales of Fixed Assets                                                                 |
| E3_880_004 | Third Country Foreign Sales of Fixed Assets                                                                   |
| E3_881_001 | Wholesale Sales on behalf of Third Parties                                                                    |
| E3_881_002 | Retail Sales on behalf of Third Parties                                                                       |
| E3_881_003 | Intra-Community Foreign Sales on behalf of Third Parties                                                      |
| E3_881_004 | Third Country Foreign Sales on behalf of Third Parties                                                        |
| E3_598_001 | Sales of goods belonging to excise duty                                                                       |
| E3_598_003 | Sales on behalf of farmers through an agricultural cooperative e.t.c.                                         |