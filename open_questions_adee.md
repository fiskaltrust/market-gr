



- Issuing a sale invoice of type Α1_1.1 with 5 lines, summarising products and services sold. 2 lines will contain products with 24% VAT, 1 line for the sale of the provision of a service at 24% VAT and tax withholding of 20% VAT and the remaining 2 lines showing sale of merchandise at 13% VAT.

- Issuing a retail sales receipt of type Α2_11.1) with 5 lines, summarising products sold. 3 lines will refer to merchandise at 24% VAT and 2 lines with merchandise at 13% VAT. The emulated sale must be towards an emulated payment terminal and demonstrate the payload of making a sale while the terminal is offline, according to Α.1155/2023. @Ioannis Pliakis can advise you on what commands you would be needing to send to our payment terminal so you can construct the payload for the emulated Cloud REST API request. You do not need to read A.1155/2023 to figure out the command sequence, Ioannis will help out with that.  

- Issuing and transmitting the invoice of type 8.4 - Απόδειξη Είσπραξης POS (POS receipt of payment) with one transaction line of total net value of EUR100.00, as an online transaction, according to Α.1155/2023 (again, @Ioannis Pliakis can help out here). This must be characterised as "Λοιπά πληροφοριακά στοιχεία εσόδων, άνευ ΦΠΑ και χωρίς χαρακτηρισμό Ε3" (miscellaneous income information without VAT or E3 designation).

- An additional issuing and transmission of invoice of type 11.1 - ΑΛΠ (Απόδειξη Λιανικής Πώλησης) - receipt of retail sale. This must contain one line of a sale 
transaction for merchandise of net value of EUR 100.00 and 24% VAT as an online transaction,, according to Α.1155/2023 (@Ioannis Pliakis can again help here).

- Αn ERP sale signing request (Provider's Signature) via the interconnection method which the e-invoice provider makes available [1st request demo] Creation, encryption and transmission of the Provider's Signature towards the ERP, via the interconnection made available by the e-invoice provider [2nd request demo]

- The interconnection of an ERP towards the POS payment terminal [3rd request demo] and its communication to the Acquirer (Viva terminal) for the approval [4th request demo] or not [5th request dem] of the sale transaction charge, as well as the corresponding creation of a unique payment ID, all done virtually in an emulated environment.

- Transmission from the payment terminal to the ERP of the payment terminal's response [6th connection request], containing the below:
  - Provider's Signature
  - Unique payment ID
  - Amount
  - Tip amount (optional)
- Transmission of the transaction data A, B and C from the e-invoice provider to myDATA's API.



Overall, the demo focuses on:

- Rest API overview for e-invoice service
- MARK _ ID_ authentication sequence
- Mandatory invoice fields and authentication, integrity and legibility of the e-invoice data (Article 15 of 4308/2014)
- Access provision to ΑΑΔΕ for the data from the standpoint of an e-invoice provider, the e-invoice provider's customer and the e-invoice's receiver in the case of wholesale
- QRcode generation
- Online – Realtime transactions
- Anonymous retail sales invoice generation
- Offline transaction scenario, applicable as a minimum in an all-in-one scenario