---
slug: /poscreators/middleware-doc/greece/reference-tables/ftpayitemcase
title: 'Type of Payment: ftPayItemCase'
---

# Type of Payment: ftPayItemCase

This table expands on the values provided in table [ftPayItemCase in General Part](../../general/reference-tables/reference-tables.md#type-of-payment-ftpayitemcase) with values applicable to the Greek market.

## Format

_CCCC_vlll_gggg_xxPP_ 

#### v - version
version 2

#### PP - payment type
| **Value**            | **Description**| [myDATA VAT Category - 8.12](https://www.aade.gr/sites/default/files/2025-07/myDATA%20API%20Documentation%20v1.0.11_official_erp.pdf)|
| -------------------- | -------------- |  -------------- | 
| `00` | **Unknown payment type for GR**<br />This is handled like a cash payment in national currency. | |
| `01` | **Cash payment**<br /> | **Cash - Code 3** <br/> **Μετρητά** |
| `02` | **NonCash**<br /> | |
| `03` | **Crossed cheque**<br /> | **Cheque - Code 4** <br/> **Επιταγή** |
| `04` | **Debit card payment**<br /> | **POS / e-POS - Code 7** <br/> **POS / e-POS** |
| `05` | **Credit card payment**<br /> | **POS / e-POS - Code 7** <br/> **POS / e-POS** |
| `06` | **Voucher payment (coupon) - voucher by money value**<br /> | **Cheque - Code 4** <br/> **Επιταγή** |
| `07` | **Online payment**<br /> | |
| `08` | **Loyalty program Customer card payment**<br />| |
| `09` | **Accounts receivable**<br /> | **On Credit - Code 5** <br/> **Επί Πιστώσε** |
| `0A` | **SEPA transfer**<br /> | **Domestic Payments Account Number - Code 1** <br/> **Επαγ. Λογαριασμός Πληρωμών Ημεδαπής** <br/><br/> `Description == "RF code payment (Web banking)"`<br/> **Web Banking - Code 6** <br/> **Web Banking** <br/><br/> `Description == "IRIS"`<br/> **IRIS Direct Payments - Code 8** <br/> **IRIS** <br/><br/> |
| `0B` | **Other Bank transfer**<br /> | **International Business Payment Account - Code 2** <br/> **Επαγ. Λογαριασμός Πληρωμών Αλλοδαπής**. |
| `0C` | **Transfer to Cashbook / Vault / Owner / Employee**<br />Positive (+) amount contributes to cashbox/vault. This higher the amount in cashbox/vault.<br />Negative (-) amount lowers the amount in cashbox/vault. | |
| `0D` | **Internal / Material consumption**<br /> | |
| `0E` | **Grant**<br /> | |
| `0F` | **Ticket Restaurant / (Sodexo, edenred, usw.)**<br /> | |

#### v - version
version 2

#### gggg - global tagging/flag
| **Value**            | **Description**                                                                                |
| -------------------- | ---------------------------------------------------------------------------------------------- | 
| `0001` | **IsVoid**<br />Marks PayItem as Void previous position. Quantity and amount are inverted, related to original item. <br />IsVoid is used in cases where the exchange of money has not been executed yet. | 
| `0002` | **IsReturn/IsRefund**<br />Marks PayItem as Return of good or service. Quantity and amount are inverted, related to original item.<br />IsReturn/IsRefund  is used in cases where the exchange of money has been executed already.| 
| `0004` |**(reserved)**<br />| 
| `0008` |**Downpayment**<br />Marks PayItem as a downpayment. <br />Positive (+) amount is reduction of downpayment. <br/>Negative (-) amount is creation of downpayment.| 
| `0010` | **IsForeignCurrency**<br />Amount is still in EUR, at the moment of acceptance. ftPayItemData requires two data elements with “foreignCurrencySymbol” and “foreignCurrencyAmount” to persist data for daily closing and later bookkeeping transactions| 
| `0020` | **IsChange**<br />Usually contains a negative (-) amount.<br /> (IsVoid => can be inverted)| |
| `0040` | **IsTip**<br />Must be a negative (-) amount to flow out of payment method.<br />ShowInChargeItems flag can be used to raise the total amount by the tip amount, to have a more convenient visualization.| |
| `0080` | **IsDigital/IsElectronic**<br />Electronic money, digital money  | |
| `0100` | **IsInterface/AmountVerified**<br />Was verified by interface, automated amount transfer | |
| `8000` | **ShowInChargeItems**<br />Visualize the item before Total Amount. This inverts amount and does include the amount into the visualized total amount on the receipt. |