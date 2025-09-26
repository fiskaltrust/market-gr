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
| `4` | **Super reduced 1 VAT rate**<br /> | **4% - Code 6** |
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

##### S - Type of Service = F (Other Special Taxes)

Whenever the integrator wants to specify taxes that are different from VAT the Type of Service `F` should be used. For all current supported cases this lineitem will also have the VAT Rate Type `8` since all these types are not taxable.

Over time there will be more standard cases that will be supported through specific NN values. Right now we support mapping based on Descriptions. As soon as the Type of Service is defined with `F` we will consider to very basic cases:

- In cases of Amount being negative, the processing logic will assume that it is a `Withholding Tax`
- In cases of Amount being positive, the processing logic will assume that it is either `Other Taxes`, `Stamp Duty` or `Fees`

| Type of Tax | Cases (Description) | MyData Code | % other Taxes | Remarks |
|---|---|---|---|---|
| **Withholding taxes** | Περιπτ. β' - Τόκοι - 15% | 1 | 15% |  |
| **Withholding taxes** | Περιπτ. γ' - Δικαιώματα - 20% | 2 | 20% |  |
| **Withholding taxes** | Περιπτ. δ' - Αμοιβές Συμβουλών Διοίκησης - 20% | 3 | 20% |  |
| **Withholding taxes** | Περιπτ. δ' - Τεχνικά Έργα - 3% | 4 | 3% |  |
| **Withholding taxes** | Υγρά καύσιμα και προϊόντα καπνοβιομηχανίας 1% | 5 | 1% |  |
| **Withholding taxes** | Λοιπά Αγαθά 4% | 6 | 4% |  |
| **Withholding taxes** | Παροχή Υπηρεσιών 8% | 7 | 8% |  |
| **Withholding taxes** | Προκαταβλητέος Φόρος Αρχιτεκτόνων και Μηχανικών επί Συμβατικών Αμοιβών, για Εκπόνηση Μελετών και Σχεδίων 4% | 8 | 4% |  |
| **Withholding taxes** | Προκαταβλητέος Φόρος Αρχιτεκτόνων και Μηχανικών επί Συμβατικών Αμοιβών, που αφορούν οποιασδήποτε άλλης φύσης έργα 10% | 9 | 10% |  |
| **Withholding taxes** | Προκαταβλητέος Φόρος στις Αμοιβές Δικηγόρων 15% | 10 | 15% |  |
| **Withholding taxes** | Παρακράτηση Φόρου Μισθωτών Υπηρεσιών παρ. 1 αρ. 15 ν. 4172/2013 | 11 | ποσό |  |
| **Withholding taxes** | Παρακράτηση Φόρου Μισθωτών Υπηρεσιών παρ. 2 αρ. 15 ν. 4172/2013 – Αξιωματικών Εμπορικού Ναυτικού | 12 | 15% |  |
| **Withholding taxes** | Παρακράτηση Φόρου Μισθωτών Υπηρεσιών παρ. 2 αρ. 15 ν. 4172/2013 – Κατώτερο Πλήρωμα Εμπορικού Ναυτικού | 13 | 10% |  |
| **Withholding taxes** | Παρακράτηση Ειδικής Εισφοράς Αλληλεγγύης | 14 | ποσό |  |
| **Withholding taxes** | Παρακράτηση Φόρου Αποζημίωσης λόγω Διακοπής Σχέσης Εργασίας παρ. 3 αρ. 15 ν. 4172/2013 | 15 | ποσό |  |
| **Withholding taxes** | Παρακρατήσεις συναλλαγών αλλοδαπής βάσει συμβάσεων αποφυγής διπλής φορολογίας (Σ.Α.Δ.Φ.) | 16 | ποσό |  |
| **Withholding taxes** | Λοιπές Παρακρατήσεις Φόρου | 17 | ποσό |  |
| **Withholding taxes** | Παρακράτηση Φόρου Μερίσματα περ.α παρ. 1 αρ. 64 ν. 4172/2013 | 18 | 5% |  |
| **Other Taxes** | α1) ασφάλιστρα κλάδου πυρός 20% | 1 | 15% | Από την έκδοση 1.0.3 είναι δυνατή η αποστολή με αυτή την τιμή. |
| **Other Taxes** | α2) ασφάλιστρα κλάδου πυρός 20% | 2 | 5% | Από την έκδοση 1.0.3 είναι δυνατή η αποστολή με αυτή την τιμή. |
| **Other Taxes** | β) ασφάλιστρα κλάδου ζωής 4% | 3 | 4% |  |
| **Other Taxes** | γ) ασφάλιστρα λοιπών κλάδων 15% | 4 | 15% |  |
| **Other Taxes** | δ) απαλλασσόμενα φόρου ασφαλίστρων 0% | 5 | 0% |  |
| **Other Taxes** | Ξενοδοχεία 1‑2 αστέρων 0,50 € | 6 | ποσό |  |
| **Other Taxes** | Ξενοδοχεία 3 αστέρων 1,50 € | 7 | ποσό |  |
| **Other Taxes** | Ξενοδοχεία 4 αστέρων 3,00 € | 8 | ποσό |  |
| **Other Taxes** | Ξενοδοχεία 4 αστέρων 4,00 € | 9 | ποσό |  |
| **Other Taxes** | Ενοικιαζόμενα – επιπλωμένα δωμάτια – διαμερίσματα 0,50 € | 10 | ποσό |  |
| **Other Taxes** | Ειδικός Φόρος στις διαφημίσεις που προβάλλονται από την τηλεόραση (ΕΦΤΔ) 5% | 11 | 5% |  |
| **Other Taxes** | 3.1 Φόρος πολυτελείας 10% επί της φορολογητέας αξίας για τα ενδοκοινοτικώς αποκτούμενα και εισαγόμενα από τρίτες χώρες | 12 | 10% |  |
| **Other Taxes** | 3.2 Φόρος πολυτελείας 10% επί της τιμής πώλησης προ Φ.Π.Α. για τα εγχωρίως παραγόμενα είδη | 13 | 10% |  |
| **Other Taxes** | Δικαίωμα του Δημοσίου στα εισιτήρια των καζίνο (80% επί του εισιτηρίου) | 14 | 80% |  |
| **Other Taxes** | ασφάλιστρα κλάδου πυρός 20% | 15 | 20% |  |
| **Other Taxes** | Λοιποί Τελωνειακοί Δασμοί‑Φόροι | 16 | ποσό |  |
| **Other Taxes** | Λοιποί Φόροι | 17 | ποσό |  |
| **Other Taxes** | Επιβαρύνσεις Λοιπών Φόρων | 18 | ποσό |  |
| **Other Taxes** | ΕΦΚ | 19 | ποσό |  |
| **Other Taxes** | Ξενοδοχεία 1‑2 αστέρων 1,50€ (ανά Δωμ./Διαμ.) | 20 | ποσό |  |
| **Other Taxes** | Ξενοδοχεία 3 αστέρων 3,00€ (ανά Δωμ./Διαμ.) | 21 | ποσό |  |
| **Other Taxes** | Ξενοδοχεία 4 αστέρων 7,00€ (ανά Δωμ./Διαμ.) | 22 | ποσό |  |
| **Other Taxes** | Ξενοδοχεία 5 αστέρων 10,00€ (ανά Δωμ./Διαμ.) | 23 | ποσό |  |
| **Other Taxes** | Ενοικιαζόμενα επιπλωμένα δωμάτια – διαμερίσματα 1,50€ (ανά Δωμ./Διαμ.) | 24 | ποσό |  |
| **Other Taxes** | Ακίνητα βραχυχρόνιας μίσθωσης 1,50€ | 25 | ποσό |  |
| **Other Taxes** | Ακίνητα βραχυχρόνιας μίσθωσης μονοκατοικίες άνω των 80 τ.μ. 10,00€ | 26 | ποσό |  |
| **Other Taxes** | Αυτοεξυπηρετούμενα καταλύματα – τουριστικές επιπλωμένες επαύλεις (βίλες) 10,00€ | 27 | ποσό |  |
| **Other Taxes** | Ακίνητα βραχυχρόνιας μίσθωσης 0,50€ | 28 | ποσό |  |
| **Other Taxes** | Ακίνητα βραχυχρόνιας μίσθωσης μονοκατοικίες άνω των 80 τ.μ. 4,00€ | 29 | ποσό |  |
| **Other Taxes** | Αυτοεξυπηρετούμενα καταλύματα – τουριστικές επιπλωμένες επαύλεις (βίλες) 4,00€ | 30 | ποσό |  |
| **Stamp duty** | Συντελεστής 1,2 % | 1 | 1,20% |  |
| **Stamp duty** | Συντελεστής 2,4 % | 2 | 2,40% |  |
| **Stamp duty** | Συντελεστής 3,6 % | 3 | 3,60% |  |
| **Stamp duty** | Λοιπές περιπτώσεις | 4 | ποσό |  |
| **Fees** | Για μηνιαίο λογαριασμό μέχρι και 50 ευρώ 12% | 1 | 12,00% |  |
| **Fees** | Για μηνιαίο λογαριασμό από 50,01 μέχρι και 100 ευρώ 15% | 2 | 15,00% |  |
| **Fees** | Για μηνιαίο λογαριασμό από 100,01 μέχρι και 150 ευρώ 18% | 3 | 18,00% |  |
| **Fees** | Για μηνιαίο λογαριασμό από 150,01 ευρώ και άνω 20% | 4 | 20,00% |  |
| **Fees** | Τέλος καρτοκινητής επί της αξίας του χρόνου ομιλίας (12%) | 5 | 12,00% |  |
| **Fees** | Τέλος στη συνδρομητική τηλεόραση 10% | 6 | 10,00% |  |
| **Fees** | Τέλος συνδρομητών σταθερής τηλεφωνίας 5% | 7 | 5,00% |  |
| **Fees** | Περιβαλλοντικό Τέλος & πλαστικής σακούλας ν. 2339/2001 αρ. 6α – 0,07 ευρώ ανά τεμάχιο | 8 | ποσό |  |
| **Fees** | Εισφορά δακοκτονίας 2% | 9 | 2,00% |  |
| **Fees** | Λοιπά τέλη | 10 | ποσό |  |
| **Fees** | Τέλη Λοιπών Φόρων | 11 | Ποσό |  |
| **Fees** | Εισφορά δακοκτονίας | 12 | Ποσό |  |
| **Fees** | Για μηνιαίο λογαριασμό κάθε σύνδεσης (10%) | 13 | 10% |  |
| **Fees** | Τέλος καρτοκινητής επί της αξίας του χρόνου ομιλίας (10%) | 14 | 10% |  |
| **Fees** | Τέλος κινητής και καρτοκινητής για φυσικά πρόσωπα ηλικίας 15 έως και 29 ετών (0%) | 15 | 0% |  |
| **Fees** | Εισφορά προστασίας περιβάλλοντος πλαστικών προϊόντων 0,04 λεπτά ανά τεμάχιο [άρθρο 4 ν. 4736/2020] | 16 | ποσό |  |
| **Fees** | Τέλος ανακύκλωσης 0,08 λεπτά ανά τεμάχιο [άρθρο 80 ν. 4819/2021] | 17 | Ποσό |  |
| **Fees** | Τέλος διαμονής παρεπιδημούντων | 18 | Ποσό |  |
| **Fees** | Τέλος επί των ακαθάριστων εσόδων των εστιατορίων και συναφών καταστημάτων | 19 | Ποσό |  |
| **Fees** | Τέλος επί των ακαθάριστων εσόδων των κέντρων διασκέδασης | 20 | Ποσό |  |
| **Fees** | Τέλος επί των ακαθάριστων εσόδων των καζίνο | 21 | Ποσό |  |
| **Fees** | Λοιπά τέλη επί των ακαθάριστων εσόδων | 22 | Ποσό |  |

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
