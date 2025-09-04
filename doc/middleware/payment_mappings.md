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