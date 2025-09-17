## Payment Type

| **FT API  <br>ftPayItemCase** | **MYDATA CODE** | **MYDATA Description** | **Receipt Label** |
| --- | --- | --- | --- |
| 01 - Cash | 3   | Cash | Μετρητά |
| 02 – Non Cash |     | NOT SUPPORTED |     |
| 03 - CrossedCheque | 4   | Cheque | Επιταγή |
| 09 - AccountsReceivable | 5   | Credit | Επί πιστώσει |
| 07 - Online Payment | 6   | Web Banking | Web Banking |
| 04 - DebitCardPayment | 7   | POS / e-POS | POS / e-POS |
| 05 - CreditCardPayment | 7   | POS / e-POS | POS / e-POS |
| 06 - VoucherPaymentCouponVoucherByMoneyValue | 4   | Cheque | Επιταγή |
| 0A - SEPATransfer <br/> 0A - SEPATransfer && Payment Description = "IRIS" <br/> 0A - SEPATransfer && Payment Description = "IRIS" | 1 <br/> 8 <br/> 6 | Domestic Business Payment Account <br/> IRIS Direct Payments <br/> Web Banking| Επαγ. Λογαριασμός Πληρωμών Ημεδαπής <br/> Αμεσες Πληρωμές IRIS <br/> Web Banking |
| 08 - LoyaltyProgramCustomerCardPayment |     | NOT SUPPORTED |     |
| 0B - OtherBankTransfer |  2   | International Business Payment Account |  Επαγ. Λογαριασμός Πληρωμών Αλλοδαπής   |
| 0C - TransferToCashbookVaultOwnerEmployee |     | NOT SUPPORTED |     |
| 0D - InternalMaterialConsumption |     | NOT SUPPORTED |     |
| 0E - Grant |     | NOT SUPPORTED |     |
| 0F – Ticket Restaurant |     | NOT SUPPORTED |     |

## Middleware Docs extension

#### PP - payment type
| **Value**            | **Description**                                                                                | **Middleware version** |
| -------------------- | ---------------------------------------------------------------------------------------------- | ---------------------- |
| `00` | **Unknown payment type for GR**<br />This is handled like a cash payment in national currency. | 1.3.45                    |
| `01` | **Cash payment**<br />myDATA Code `3`                                                | 1.3.45                    |
| `02` | **NonCash**<br />cash                                                 |  NOT SUPPORTED                     |
| `03` | **Crossed cheque**<br />cash                                                                   | 1.3.45                    |
| `04` | **Debit card payment**<br />cash                                                            | 1.3.45                    |
| `05` | **Credit card payment**<br />cash                                                              | 1.3.45                    |
| `06` | **Voucher payment (coupon) - voucher by money value**<br />cash                                | 1.3.45                    |
| `07` | **Online payment**<br />noncash                                                                | 1.3.45                    |
| `08` | **Loyalty program Customer card payment**<br />|1.3.45|
| `09` | **Accounts receivable**<br />| 1.3.45                    |
| `0A` | **SEPA transfer**<br />| 1.3.45                    |
| `0B` | **Other Bank transfer**<br />| 1.3.45                    |
| `0C` | **Transfer to Cashbook / Vault / Owner / Employee**<br />Positive (+) amount contributes to cashbox/vault. This higher the amount in cashbox/vault.<br />Negative (-) amount lowers the amount in cashbox/vault. | NOT SUPPORTED |
| `0D` | **Internal / Material consumption**<br />| NOT SUPPORTED |
| `0E` | **Grant**<br />| NOT SUPPORTED |
| `0F` | **Ticket Restaurant / (Sodexo, edenred, usw.)**<br />| NOT SUPPORTED |