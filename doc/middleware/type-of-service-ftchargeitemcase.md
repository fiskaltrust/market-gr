---
slug: /poscreators/middleware-doc/greece/reference-tables/ftchargeitemcase
title: 'Type of service: ftChargeItemCase'
---

# Type of Service: ftChargeItemCase

This table expands on the values provided in the table [ftChargeItemCase in General Part](../../general/reference-tables/reference-tables.md#type-of-service-ftchargeitemcase), with country-specific values applicable to the Greek market.

## Format
_CCCC_vlll_gggg_NNSV_ 

#### v - version
version 2

#### V - VAT  
https://europa.eu/youreurope/business/taxation/vat/vat-rules-rates/index_en.htm 

| **Value**            | **Description**| [myDATA VAT Category - 8.2](https://www.aade.gr/sites/default/files/2025-07/myDATA%20API%20Documentation%20v1.0.11_official_erp.pdf)<sup>1</sup>|
| -------------------- | -------------- |  -------------- | 
| `0` | **Unknown type of service for GR**<br />With the help of the VAT-rates table saved within fiskaltrust.SecurityMechanisms. | |
| `1` | **Discounted-1 VAT rate**<br /> | **6% - Code 3** <br/> **9% - Code 5** <br/><br/> _Depending on the selected VAT Rate <br/> it is internally mapped to the right myDATA Code._  |
| `2` | **Discounted 2 VAT rate**<br /> | **13% - Code 2** <br/> **17% - Code 4** <br/><br/> _Depending on the selected VAT Rate <br/> it is internally mapped to the right myDATA Code._ |
| `3` | **Normal VAT rate**<br /> | **24% - Code 1** |
| `4` | **Super reduced 1 VAT rate**<br /> | **VatRate4 - 6** |
| `5` | **Super reduced 2 VAT rate**<br /> | |
| `6` | **Parking VAT rate**<br /> | |
| `7` | **Zero VAT rate**<br /> | **0% - Code 7** |
| `8` | **Not Taxable**<br /> | **No VAT (0%) - Code 8**  |

<sup>1</sup> myDATA Code 9 and 10 are currently not supported.


#### S - Type of Service  

| **Value**            | **Description** | myDATA Processing <sup>2</sup>&nbsp;&nbsp;<sup>3</sup>| 
| -------------------- | -------------- | -------------- |
| `0` | **Unknown type of service**<br />With the help of the VAT-rates table saved within fiskaltrust.SecurityMechanisms. |  | 
| `1` | **Delivery (supply of goods)**<br />| **IncomeCategory category1_1** | 
| `2` | **Other service (supply of service)**<br />| **IncomeCategory category1_3** | 
| `3` | **Tip**<br /> For owner use V=0 to 7, related to total amount <br /> For Employee use V=8, Not Taxable. | | 
| `4` | **Voucher**<br /> For Single-Use-Voucher use V=0 to 7<br />For Multi-Use-Voucher use V=8, Not Taxable<br />Voucher Sale is a positive (+) amount.<br />Voucher Redeem is a negative (-) amount.<br />IsVoid can be applied to reverse amounts.<br />Avoid to use this for Multi-Use-Voucher, use PayItem instead, with ShowInChargeItems flag. For Single-Use-Voucher, apply the ShowInPayItems flag to visualize it similar to payment and to keep the total amount unreduced. | | 
| `5` | **Catalog service / Own Products**<br /> | **IncomeCategory category1_2** | 
| `6` | **Not own sales / Agency business**<br />| | 
| `7` | **Own Consumption**<br />| **IncomeCategory category1_6** | 
| `8` | **Grant**<br />For Unreal Grant use V=0 to 7<br />For Real Grant use V=8  | | 
| `9` | **Receivable**<br />Receiveable creation is negative (-) amount<br />Receiveable reduction is positive (+) amount.<br />IsVoid can be applied to reverse amounts.<br />Avoid to use this, use PayItem instead.  | |   
| `A` | **Cash Transfer**<br />Cash Transfer to till is positive (+) amount<br />Cash Transfer from till is negative (-) amount.<br />Only useable with V=8, Not Taxable. <br />IsVoid can be applied to reverse amounts| |    

<sup>2</sup> The income categories category1_4, category1_5, category 1_7, category 1_8, category1_9, category1_10, category 1_95, category3 are currently not supported.

<sup>3</sup> Currently the transmission of expense categories is not supported.

#### gggg - global tagging/flag 

| **Value**            | **Description**                                                                                        | 
| -------------------- | -------------- | 
| `0001` | **IsVoid**<br />Marks ChargeItem as Void previous position. Quantity and amount are inverted, related to original item. | 
| `0002` | **IsReturn/IsRefund**<br />Marks ChargeItem as Return of good or service. Quantity and amount are inverted, related to original item. | 
| `0004` | **Discount**<br />Marks ChargeItem as Discount/Extra for previous position. <br />Positive (+) amount is extra. <br />Negative (-) amount is discount<br />IsVoid or IsReturn/IsRefund will invert this behavior.| 1.3.67  |
| `0008` | **Downpayment**<br /> Marks ChargeItem as a downpayment.<br />Positive (+) amount is the creation of downpayment.<br />Negative (-) amount is reduction of downpayment.<br />IsVoid or IsReturn/IsRefund will invert this behavior. | 
| `0010` | **Returnable**<br /> Marks ChargeItem as a returnable.<br />Positive (+) amount/quantity is handout.<br />Negative (-) amount/quantity is reverse.<br />IsVoid or IsReturn/IsRefund will invert this behavior.| 
| `0020` | **TakeAway** <br />Marks ChargeItem as TakeAway item to prove special VAT application | 
| `8000` | **ShowInPayments**<br />Visualize the item after Total Amount. This inverts amount and does not include the amount into the visualized total amount on the receipt.  | 

## ftChargeItemCaseFlag
This table shows flags that can be added to each `ftChargeItemCase` with values applicable to the Greek market. 
