Sample Exchange Definition for issuance.

Use case: The Holder is required to prove control over DID, thus exchange definition of type `DIDAuth` is required.

```json
{
    "exchangeId": "286bc1e0-f1bd-488a-a873-8d71be3c690e",
    "query": [
      {
        "type": "DIDAuth",
        "credentialQuery": []
      }
    ],
    "interactServices": [
      {
        "type": "MediatedHttpPresentationService2021"
      }
    ],
    "callback": [
      {
        "url": "https://webhook.site/efb19fb8-2579-4e1b-8614-d5a03edaaa7a"
      }
    ],
    "isOneTime":true
}
```