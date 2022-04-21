<!--
 Copyright 2021, 2022 Energy Web Foundation
 
 This program is free software: you can redistribute it and/or modify
 it under the terms of the GNU General Public License as published by
 the Free Software Foundation, either version 3 of the License, or
 (at your option) any later version.
 
 This program is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 GNU General Public License for more details.
 
 You should have received a copy of the GNU General Public License
 along with this program.  If not, see <http://www.gnu.org/licenses/>.
-->

# Tutorial

## Overview and Objective
The objective of this tutorial is to demonstrate how to go through the SSI flows of the "Rebeam" use case.
There are three parties in this tutorial:
- The Energy Supplier, which is acting as a credential issue
- The Customer, which is acting as a credential holder
- The CPO, which is acting as a credential verifier

High-level workflow:
- The supplier issues a "contract" credential to the customer 
- The customer presents the credential to a CPO

A generic diagram of credential issuance flow is available in the root [README](./../../../README.md).

## Tutorial Steps

### Setup

#### Access the app

Run the app as per the instructions in the root [README](./../../../README.md).

#### [Optional] Setup the Postman Collection

First, download and install [Postman](https://www.postman.com/downloads/).

Then, from the Postman app, import [the open-api json](./open-api.json) and [the environment](./ewf-ssi-wallet.postman_environment.json) for the Nest.js wallet. Instructions on how to import into Postman can be found [here](https://learning.postman.com/docs/getting-started/importing-and-exporting-data/#importing-data-into-postman).

#### [Optional] Navigate to the Swagger/OpenAPI page

After running the app, requests can be made using the Swagger/OpenAPI page. See [instructions](./../../../README.md#swaggeropenapi)

### Customer contract issuance

#### [Customer] Create DID

The customer needs a DID to which the supplier can issue a credential.
This DID will be the Subject identifier of our credential.

Navigate to the `DID Controller create` request under the `did` folder.
Ensure the request body is as shown and send.
```json
{
    "method": "key"
}
```
This should give a response similar to this one, with a different `did`.
Note down the `id` property. This is the customer's DID.
```json
{
    "id": "did:key:z6MkrMzkYMnPvQptgPk3E9BmkNzYGFh1Hs5U3WZHTDJgufvn",
    "verificationMethod": [
        {
            "id": "did:key:z6MkrMzkYMnPvQptgPk3E9BmkNzYGFh1Hs5U3WZHTDJgufvn#z6MkrMzkYMnPvQptgPk3E9BmkNzYGFh1Hs5U3WZHTDJgufvn",
            "type": "Ed25519VerificationKey2018",
            "controller": "did:key:z6MkrMzkYMnPvQptgPk3E9BmkNzYGFh1Hs5U3WZHTDJgufvn",
            "publicKeyJwk": {
                "crv": "Ed25519",
                "x": "sPMLz2IQhMA-_W2urtbiUyEEgEf_kgRpZfnZXDGXvLc",
                "kty": "OKP",
                "kid": "dT4nPSrLt_Vngf0Bpo0ZanOQ0HcduNB8AM-_4KKk_30"
            }
        }
    ]
}
```

#### [Supplier] Issue "customer contract" credential

First, the supplier needs a DID from which they can issue a credential.
Again, navigate to the `DID Controller create` request under the `did` folder.
Ensure the request body is as shown and send.
```json
{
    "method": "key"
}
```

Again, this should give a response similar to this one, with a different `did`.
Note down the `id` property. This is the suppliers's DID.

```json
{
    "id": "did:key:z6MkqtPi8BfTpC1gitAePJz73A1aTj5gEeecQHW4pwfC9PeJ",
    "verificationMethod": [
        {
            "id": "did:key:z6MkqtPi8BfTpC1gitAePJz73A1aTj5gEeecQHW4pwfC9PeJ#z6MkqtPi8BfTpC1gitAePJz73A1aTj5gEeecQHW4pwfC9PeJ",
            "type": "Ed25519VerificationKey2018",
            "controller": "did:key:z6MkqtPi8BfTpC1gitAePJz73A1aTj5gEeecQHW4pwfC9PeJ",
            "publicKeyJwk": {
                "crv": "Ed25519",
                "x": "qeC-F4pWhck7tIplhNo-qkISlfa2_H2x0fVBNqH0XDs",
                "kty": "OKP",
                "kid": "96gNvxG0qgZVYsmuME2EZfH3EwaWvtRalzKOEYw4Y5E"
            }
        }
    ]
}
```

After having created a new DID, the supplier can then issue a credential to the customer DID that was previously created.
The supplier may want to confirm that the customer in question controls the DID first, however this step is currently omitted.

Navigate to the `Vc Api Controller issue Credential` request under the `vc-api` folder.
Fill in, in the JSON below, the Customer DID as the `subject` id, the Supplier DID as the `issuer` id and the `verificationMethod.id` from the DID document of the Supplier as the `options.verificationMethod` from the DIDs that were generated in previous steps.

```json
{
  "credential": {
        "@context":[
            "https://www.w3.org/2018/credentials/v1",
            {
                "issuerFields":{
                    "@id":"ew:issuerFields",
                    "@type":"ew:IssuerFields"
                },
                "namespace":"ew:namespace",
                "role":{
                    "@id":"ew:role",
                    "@type":"ew:Role"
                },
                "ew":"https://energyweb.org/ld-context-2022#",
                "version":"ew:version",
                "EWFRole":"ew:EWFRole"
            }
        ],
        "id":"urn:uuid:7f94d397-3e70-4a43-945e-1a13069e636f",
        "type":[
            "VerifiableCredential",
            "EWFRole"
        ],
        "credentialSubject":{
            "id":"<FILL CUSTOMER DID>",
            "issuerFields":[
                
            ],
            "role":{
                "namespace":"customer.roles.rebeam.apps.eliagroup.iam.ewc",
                "version":"1"
            }
        },
        "issuer":"<FILL SUPPLIER DID>",
        "issuanceDate":"2022-03-18T08:57:32.477Z"
    },
    "options": {
        "verificationMethod": "<FILL SUPPLIER VERIFICATION METHOD>",
        "proofPurpose": "assertionMethod"
    }
}
```

Once the DIDs are filled in, send the request.
The response should have a `201` code and have a body similar to the json below.

```json
{
    "@context": [
        "https://www.w3.org/2018/credentials/v1",
        {
            "EWFRole": "ew:EWFRole",
            "issuerFields": {
                "@id": "ew:issuerFields",
                "@type": "ew:IssuerFields"
            },
            "namespace": "ew:namespace",
            "ew": "https://energyweb.org/ld-context-2022#",
            "version": "ew:version",
            "role": {
                "@id": "ew:role",
                "@type": "ew:Role"
            }
        }
    ],
    "id": "urn:uuid:7f94d397-3e70-4a43-945e-1a13069e636f",
    "type": [
        "VerifiableCredential",
        "EWFRole"
    ],
    "credentialSubject": {
        "id": "did:key:z6MkrMzkYMnPvQptgPk3E9BmkNzYGFh1Hs5U3WZHTDJgufvn",
        "role": {
            "namespace": "customer.roles.rebeam.apps.eliagroup.iam.ewc",
            "version": "1"
        },
        "issuerFields": []
    },
    "issuer": "did:key:z6MkqtPi8BfTpC1gitAePJz73A1aTj5gEeecQHW4pwfC9PeJ",
    "issuanceDate": "2022-03-18T08:57:32.477Z",
    "proof": {
        "type": "Ed25519Signature2018",
        "proofPurpose": "assertionMethod",
        "verificationMethod": "did:key:z6MkqtPi8BfTpC1gitAePJz73A1aTj5gEeecQHW4pwfC9PeJ#z6MkqtPi8BfTpC1gitAePJz73A1aTj5gEeecQHW4pwfC9PeJ",
        "created": "2022-03-22T16:17:50.994Z",
        "jws": "eyJhbGciOiJFZERTQSIsImNyaXQiOlsiYjY0Il0sImI2NCI6ZmFsc2V9..UJTi-5zvCcuX0ykMTO1pDso0DkATzUDHd1TT2pd9B6AJaUtqA_OHs_WjjHhhg5MKQV_sX8HV1UK2yWZ7skptBQ"
    }
}
```

### EV Charging

#### [CPO] Configure Credential Exchange

The CPO needs to configure the parameters of the credential exchange.
To do this, navigate to the `Vc Api Controller create Exchange` under `vc-api/exchanges` and send with the json below.
In the json below, `exchangeId` is an id unique to this charging request, for example a UUID.

```json
{
   "exchangeId":"<SOME UNIQUE ID>",
   "query":[
      {
         "type":"PresentationDefinition",
         "credentialQuery":[
            {
               "presentationDefinition":{
                  "id":"286bc1e0-f1bd-488a-a873-8d71be3c690e",
                  "input_descriptors":[
                     {
                        "id":"energy_supplier_customer_contract",
                        "name":"Energy Supplier Customer Contract",
                        "purpose":"An energy supplier contract is needed for Rebeam authorization",
                        "constraints":{
                           "fields":[
                              {
                                 "path":[
                                    "$.credentialSubject.role.namespace"
                                 ],
                                 "filter":{
                                    "type":"string",
                                    "const":"customer.roles.rebeam.apps.eliagroup.iam.ewc"
                                 }
                              }
                           ]
                        }
                     }
                  ]
               }
            }
         ]
      }
   ],
   "interactServices":[
      {
         "type":"UnmediatedHttpPresentationService2021"
      }
   ],
   "isOneTime":true,
   "callback":[
      {
         "url":"http://example.com"
      }
   ]
}
```

The response should have a `201` code and have an empty errors array.

#### [CPO] Provide an exchange invitation to the customer

Having configured the exchange, the CPO must then ask the customer to present the required credentials in order to authorize the charging session.
This is not performed in this demo, but in an actual Rebeam charging flow a CPO delivers a presentation invitation similar to one shown below to the customer via the eMSP.

```json
{
  "outOfBandInvitation": {
    "type": "https://example.com/out-of-band/vc-api-exchange",
    "body": {
      "url": "http://localhost:3000/vc-api/exchanges/<FILL WITH YOUR EXCHANGE ID>"
    }
  }
}
```

#### [Customer] Present required credentials

Initiate the credential exchange by POSTing to the `url` directly in Postman or by navigating to the `Vc Api Controller initiate Exchange` request in the collection.
If using the collection request, fill in the `exchangeId` param to be the value used for the exchange Id by the CPO.

Send the request. A similar json should be returned in the response body:
```json
{
    "errors": [],
    "vpRequest": {
        "challenge": "9df7ee08-6ed3-4090-b612-a2333fdf154d",
        "query": [
            {
                "type": "PresentationDefinition",
                "credentialQuery": [
                    {
                        "presentationDefinition": {
                            "id": "286bc1e0-f1bd-488a-a873-8d71be3c690e",
                            "input_descriptors": [
                                {
                                    "id": "energy_supplier_customer_contract",
                                    "name": "Energy Supplier Customer Contract",
                                    "purpose": "An energy supplier contract is needed for Rebeam authorization",
                                    "constraints": {
                                        "fields": [
                                            {
                                                "path": [
                                                    "$.credentialSubject.role.namespace"
                                                ],
                                                "filter": {
                                                    "type": "string",
                                                    "const": "customer.roles.rebeam.apps.eliagroup.iam.ewc"
                                                }
                                            }
                                        ]
                                    }
                                }
                            ]
                        }
                    }
                ]
            }
        ],
        "interact": {
            "service": [
                {
                    "type": "UnmediatedHttpPresentationService2021",
                    "serviceEndpoint": "http://localhost:3000/vc-api/exchanges/123/a82bea76-57ec-40b6-b300-11729e81cb09"
                }
            ]
        }
    }
}
```
The `challenge` value and the final fragment of the `serviceEndpoint`, which is the `transaction id`, should be different.

The response contains a VP Request, which is a specification defined here: https://w3c-ccg.github.io/vp-request-spec/.
You can see that the VP Request's `query` section contains a `PresentationDefinition` query.
This means that the holder must provide credentials which satisfy the `presentationDefinition`.

Also note the `service` in the `interact` section of the VP Request.
This is providing the location at which we can continue the credential request flow once we have met the `query` requirements.
      
### [Customer] Create the required presentation

Then, open the `Vc Api Controller prove Presentation` request under the `vc-api/presentations/prove` folder.
In the request body, use the following json, filled with your own values.
The `challenge` should be value received from the VP Request in the previous step.

```json
{
    "presentation": {
        "@context":[
            "https://www.w3.org/2018/credentials/v1",
            "https://www.w3.org/2018/credentials/examples/v1"
        ],
        "type":[
            "VerifiablePresentation"
        ],
        "verifiableCredential":[
            "<FILL WITH VC RECEIVED FROM SUPPLIER>"
        ],
        "holder": "<FILL WITH HOLDER DID>"
    },
    "options": {
        "verificationMethod": "<FILL WITH HOLDER DID VERIFICATION METHOD",
        "proofPurpose": "authentication",
        "challenge": "<FILL WITH CHALLENGE FROM VP REQUEST>"
    }
}
```

For example, your filled json would look like:

```json
{
    "presentation": {
        "@context":[
            "https://www.w3.org/2018/credentials/v1",
            "https://www.w3.org/2018/credentials/examples/v1"
        ],
        "type":[
            "VerifiablePresentation"
        ],
        "verifiableCredential":[
            {
                "@context": [
                    "https://www.w3.org/2018/credentials/v1",
                    {
                        "EWFRole": "ew:EWFRole",
                        "issuerFields": {
                            "@id": "ew:issuerFields",
                            "@type": "ew:IssuerFields"
                        },
                        "namespace": "ew:namespace",
                        "ew": "https://energyweb.org/ld-context-2022#",
                        "version": "ew:version",
                        "role": {
                            "@id": "ew:role",
                            "@type": "ew:Role"
                        }
                    }
                ],
                "id": "urn:uuid:7f94d397-3e70-4a43-945e-1a13069e636f",
                "type": [
                    "VerifiableCredential",
                    "EWFRole"
                ],
                "credentialSubject": {
                    "id": "did:key:z6MkrMzkYMnPvQptgPk3E9BmkNzYGFh1Hs5U3WZHTDJgufvn",
                    "role": {
                        "namespace": "customer.roles.rebeam.apps.eliagroup.iam.ewc",
                        "version": "1"
                    },
                    "issuerFields": []
                },
                "issuer": "did:key:z6MkqtPi8BfTpC1gitAePJz73A1aTj5gEeecQHW4pwfC9PeJ",
                "issuanceDate": "2022-03-18T08:57:32.477Z",
                "proof": {
                    "type": "Ed25519Signature2018",
                    "proofPurpose": "assertionMethod",
                    "verificationMethod": "did:key:z6MkqtPi8BfTpC1gitAePJz73A1aTj5gEeecQHW4pwfC9PeJ#z6MkqtPi8BfTpC1gitAePJz73A1aTj5gEeecQHW4pwfC9PeJ",
                    "created": "2022-03-22T16:17:50.994Z",
                    "jws": "eyJhbGciOiJFZERTQSIsImNyaXQiOlsiYjY0Il0sImI2NCI6ZmFsc2V9..UJTi-5zvCcuX0ykMTO1pDso0DkATzUDHd1TT2pd9B6AJaUtqA_OHs_WjjHhhg5MKQV_sX8HV1UK2yWZ7skptBQ"
                }
            }
        ],
        "holder": "did:key:z6MkrMzkYMnPvQptgPk3E9BmkNzYGFh1Hs5U3WZHTDJgufvn"
    },
    "options": {
        "verificationMethod": "did:key:z6MkrMzkYMnPvQptgPk3E9BmkNzYGFh1Hs5U3WZHTDJgufvn#z6MkrMzkYMnPvQptgPk3E9BmkNzYGFh1Hs5U3WZHTDJgufvn",
        "proofPurpose": "authentication",
        "challenge": "f838dd0a-697e-4712-9194-3227a2604fdc"
    }
}
```

Send the request. The response should be a verifiable presentation, similar to the one below.
```json
{
    "@context": [
        "https://www.w3.org/2018/credentials/v1",
        "https://www.w3.org/2018/credentials/examples/v1"
    ],
    "type": [
        "VerifiablePresentation"
    ],
    "verifiableCredential": [
        {
            "@context": [
                "https://www.w3.org/2018/credentials/v1",
                {
                    "issuerFields": {
                        "@id": "ew:issuerFields",
                        "@type": "ew:IssuerFields"
                    },
                    "namespace": "ew:namespace",
                    "ew": "https://energyweb.org/ld-context-2022#",
                    "EWFRole": "ew:EWFRole",
                    "role": {
                        "@id": "ew:role",
                        "@type": "ew:Role"
                    },
                    "version": "ew:version"
                }
            ],
            "id": "urn:uuid:7f94d397-3e70-4a43-945e-1a13069e636f",
            "type": [
                "VerifiableCredential",
                "EWFRole"
            ],
            "credentialSubject": {
                "id": "did:key:z6MkrMzkYMnPvQptgPk3E9BmkNzYGFh1Hs5U3WZHTDJgufvn",
                "role": {
                    "namespace": "customer.roles.rebeam.apps.eliagroup.iam.ewc",
                    "version": "1"
                },
                "issuerFields": []
            },
            "issuer": "did:key:z6MkqtPi8BfTpC1gitAePJz73A1aTj5gEeecQHW4pwfC9PeJ",
            "issuanceDate": "2022-03-18T08:57:32.477Z",
            "proof": {
                "type": "Ed25519Signature2018",
                "proofPurpose": "assertionMethod",
                "verificationMethod": "did:key:z6MkqtPi8BfTpC1gitAePJz73A1aTj5gEeecQHW4pwfC9PeJ#z6MkqtPi8BfTpC1gitAePJz73A1aTj5gEeecQHW4pwfC9PeJ",
                "created": "2022-03-22T16:17:50.994Z",
                "jws": "eyJhbGciOiJFZERTQSIsImNyaXQiOlsiYjY0Il0sImI2NCI6ZmFsc2V9..UJTi-5zvCcuX0ykMTO1pDso0DkATzUDHd1TT2pd9B6AJaUtqA_OHs_WjjHhhg5MKQV_sX8HV1UK2yWZ7skptBQ"
            }
        }
    ],
    "proof": {
        "type": "Ed25519Signature2018",
        "proofPurpose": "authentication",
        "challenge": "f838dd0a-697e-4712-9194-3227a2604fdc",
        "verificationMethod": "did:key:z6MkrMzkYMnPvQptgPk3E9BmkNzYGFh1Hs5U3WZHTDJgufvn#z6MkrMzkYMnPvQptgPk3E9BmkNzYGFh1Hs5U3WZHTDJgufvn",
        "created": "2022-03-22T16:24:00.673Z",
        "jws": "eyJhbGciOiJFZERTQSIsImNyaXQiOlsiYjY0Il0sImI2NCI6ZmFsc2V9..VLIUQe4B7fDtD5cpHkvGJB4OcWICy5HWT8LQvdAtjj4f-3CjhZdG4PYNo5Lr4KlsGdfdKhbZkvKRnEWriIkJAg"
    },
    "holder": "did:key:z6MkrMzkYMnPvQptgPk3E9BmkNzYGFh1Hs5U3WZHTDJgufvn"
}
```

### [Customer] Continue the exchange

Continue the exchange by sending the VP in response to the VP Request that was previously received.

To do this, open the `Vc Api Controller continue Exchange` request in the `vc-api/exchanges/{exchange Id}` folder.
In the request params, use the `transactionId` and `exchangeId` from the `serviceEndpoint` in the VP Request.

In the request body, copy the VP that was obtained from the previous step.


Send the request. The response should have a `200` status code and have an empty `errors` array, as shown below.
```json
{
    "errors": []
}
```

Having the submitted the presentation, the CPO will now be convinced of the Customer's energy contract and allow them to to charge!