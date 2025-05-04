# Implictly signed Payment

The following section describes the mechanism to process viva based payments implicitly. While most other scenarios require the caller to send the Signature of the Payment as part of our certification we are able to do this implicitly. 

With the following calculation the signature is generated AFTER the payment has been executed. This signature is then sent as part of the payload that is sent to myDATA.

- Random sequence of characters
- ; empty
- ; Moment of the PayItem
- ; Amount of the PayItem
- ; NetAmount of Receipt (!!)
- ; MaxVatRate of Receipt based on ChargeItems
- ; Amount of the PayItem
- ; ReceiptRequest.cbTerminalID

The following section shows an example of a PayItem including the necessary data for correct fiscalization. While most other fields are based on the fields described in https://docs.fiskaltrust.eu/docs/poscreators/middleware-doc/greece/reference-tables/ftpayitemcase the field `ftPayItemCaseData` is filled with the dataformat necessary to process.

The `ftPayItemCaseData` has the following required fields:

- Action: (filled with PaymentActionEnum https://docs.fiskaltrust.eu/apis/pos-system-api#tag/pay/operation/PayRequestAsnyc)
- Protocol: viva_eft_pos_implicit
- ProtocolVersion: 1.0.0
- ProtocolResponse: object
- ProtocolResponse.aadeTransactionId: Transaction Id from payment

```json
{
  "Description": "Κάρτα",
  "ftPayItemCase": 5139205309155246084,
  "Amount": 4.6,
  "ftPayItemCaseData": {
    "Action": "payment",
    "Protocol": "viva_eft_pos_implicit",
    "ProtocolVersion": "1.0.0",
    "Provider": {
      "ProtocolRequest": {
        "terminalId": "16007793",
        "amount": 460
      },
      "ProtocolResponse": {
        "aadeTransactionId": "116431710567012567012"
      },
    }
  },
  "Moment": "2019-11-08T08:29:58.91Z"
}
```

