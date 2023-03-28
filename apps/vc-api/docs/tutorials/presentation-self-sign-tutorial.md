<!--
 Copyright 2021 - 2023 Energy Web Foundation
 
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

## Business overview
The business objective of this tutorial is to demonstrate how a verifier can request multiple credentials and how a holder can present multiple credentials in a presentation that meets this request. 

For this tutorial we would use a self signed (consent) Verifiable Credential (VC) and another VC issued to the user (holder) connected to a portal that we will call "authority portal".

In the example below, we will issue a permanent residency card to a user we will call "resident". We use the context "https://w3id.org/residentship/v1" which describes the data of a VC of type "PermanentResidentCard". As second credential we will use a consent credential (self signed) by the user (holder).

### Business workflows

#### Issuance and Consent Credential Business workflow
1. The resident creates their DID.
2. The resident obtains a "PermanentResidentCard" from the authority.

#### Presentation Business workflow
1. The authority portal displays a QR code requesting a presentation containing the "PermanentResidentCard" and "ConsentCredential" credential.
2. The resident creates a self-signed consent Verifiable Credential as the second credential.
3. The resident scans the QR code with their mobile wallet and prompts the user for permission to present the "PermanentResidentCard" and "ConsentCredential" credential.
4. The resident confirms and the presentation is submitted to the authority portal who can then authorize the resident.

## Technical overview
From a technical point of view, in this tutorial, we have access to the server API but no mobile wallet is available. So we will use the server API for both roles of the portal and the resident's mobile wallet.

### Technical workflows

#### 1. Credential Issuance workflow
- [1.1 [Resident] Create a DID](#11-resident-create-a-did)
- [1.2 [Resident] Obtain a ResidentCard credential](#12-obtain-permanentresidentcard-credential)

#### 2. Presentation workflow
- [2.1  [Verifier] Configure Credential Exchange](#21-verifier-configure-credential-exchange)
- [2.2  [Verifier] Provide an exchange invitation to the resident](#22-verifier-provide-an-exchange-invitation-to-the-resident)
- [2.3  [Resident] Initiate the presentation exchange](#23-resident-initiate-the-presentation-exchange)
- [2.4  [Resident] Issue a self-signed credential](#24-resident-issue-a-self-signed-credential)
- [2.5  [Resident] Create the required presentation](#24-resident-create-the-required-presentation)
- [2.6  [Resident] Continue the exchange](#25-resident-continue-the-exchange)
- [2.7  [Verifier] Act on Submitted Presentation](#26-verifier-act-on-submitted-presentation)

## Overview and Objective

The objective of this tutorial is walk through a simple multiple credential issuance (self signed and credential issued by issuer) and presentation flow.
A diagram of this flow is available in the [Exchanges Documentation](../exchanges.md).

## Steps
### 0. Setup the Postman Collection

First, download and install [Postman](https://www.postman.com/downloads/).

Then, from the Postman app, import [the open-api json](../openapi.json) and [the environment](../vc-api.postman_environment.json) for VC-API. Instructions on how to import into Postman can be found [here](https://learning.postman.com/docs/getting-started/importing-and-exporting-data/#importing-data-into-postman).

### 1. Permanent Resident Card issuance

#### 1.1 [Resident] Create a DID

Let's create a new DID for which the citizen can prove control.
This DID will be the Subject identifier of the Resident Card credential.

Navigate to the `DID Controller create` request under the `did` folder.

Send the request as described below.

**Request URL**

`{VC API base url}/did`

**HTTP Verb**

`POST`

**Request Body**

```json
{
    "method": "key"
}
```

**Sample Expected Response Body**

Response body should be similar to the one below but with a different `did`.
```json
{
    "id": "did:key:z6MkvWkza1fMBWhKnYE3CgMgxHem62YkEw4JbdmEZeFTEZ7A",
    "verificationMethod": [
        {
            "id": "did:key:z6MkvWkza1fMBWhKnYE3CgMgxHem62YkEw4JbdmEZeFTEZ7A#z6MkvWkza1fMBWhKnYE3CgMgxHem62YkEw4JbdmEZeFTEZ7A",
            "type": "Ed25519VerificationKey2018",
            "controller": "did:key:z6MkvWkza1fMBWhKnYE3CgMgxHem62YkEw4JbdmEZeFTEZ7A",
            "publicKeyJwk": {
                "crv": "Ed25519",
                "x": "7qB2-hwO1ajv4CaLjfK7iB13JPUdGLObB8JGjy95KI0",
                "kty": "OKP",
                "kid": "i9CHqa1zwV23F8sxGszjXB53SnB-gKO7aL9hDcmA-ho"
            }
        }
    ]
}
```

#### 1.2 Obtain PermanentResidentCard credential

Using the above created `DID` get a ResidentCard Credential using [resident-card-tutorial](./resident-card-tutorial.md).

Kindly follow all steps of [issuance workflow](./resident-card-tutorial.md/#1-issuance-workflow) except [creating a new `DID`](./resident-card-tutorial.md/#14-resident-create-a-did).

**Sample ResidentCard Credential**

```json
{
  "@context": [
    "https://www.w3.org/2018/credentials/v1",
    "https://w3id.org/citizenship/v1"
  ],
  "id": "https://issuer.oidp.uscis.gov/credentials/83627465",
  "type": [
    "VerifiableCredential",
    "PermanentResidentCard"
  ],
  "credentialSubject": {
    "id": "did:key:z6MksGpmJLgzBtCaGVdQ9wuET2JUK2Qi4URPuYbruD6Rko35",
    "birthDate": "1958-07-17",
    "image": "data:image/png;base64,iVBORw0KGgo...kJggg==",
    "lprNumber": "999-999-999",
    "residentSince": "2015-01-01",
    "type": [
      "PermanentResident",
      "Person"
    ],
    "commuterClassification": "C1",
    "familyName": "SMITH",
    "lprCategory": "C09",
    "birthCountry": "Bahamas",
    "givenName": "JOHN",
    "gender": "Male"
  },
  "issuer": "did:key:z6Mkfh7Ac2ub5A5vMb3iUnWnWRey54CMYqsD14edvQTJKKNU",
  "issuanceDate": "2019-12-03T12:19:52Z",
  "proof": {
    "type": "Ed25519Signature2018",
    "proofPurpose": "assertionMethod",
    "verificationMethod": "did:key:z6Mkfh7Ac2ub5A5vMb3iUnWnWRey54CMYqsD14edvQTJKKNU#z6Mkfh7Ac2ub5A5vMb3iUnWnWRey54CMYqsD14edvQTJKKNU",
    "created": "2023-01-24T13:43:26.129Z",
    "jws": "eyJhbGciOiJFZERTQSIsImNyaXQiOlsiYjY0Il0sImI2NCI6ZmFsc2V9..mZcEc2cxjD9yk6qebqzKxy50IKjhoel6pykwZUlRkgNc9dOvlCzAvkv889eW8Vr_TUUyP8jdgpuEoLozwf-dBw"
  },
  "expirationDate": "2039-12-03T12:19:52Z"
}
```

### 2. Permanent Resident Card and Consent Credential verification

#### 2.1 [Verifier] Configure Credential Exchange

The Verifier needs to configure the parameters of the credential exchange by sending an [Exchange Definition](../exchanges.md#exchange-definitions).
To do this, navigate to the `Vc Api Controller create Exchange` under `vc-api/exchanges` and send with the json below.

Send the request as described below.

**Request URL**

`{VC API base url}/vc-api/exchanges`

**HTTP Verb**

`POST`

**Request Body**

Fill `exchangeId` in the json below.
`exchangeId` should be an id unique to this exchange, for example a UUID.

Note the constraint on the `$.type` path of the credential.
This is used to require that the presented credentials are of type "PermanentResidentCard" and "ConsentCredential".
For further documentation regarding the `presentationDefinition`, can be seen [here](../exchanges.md#presentation-definition-queries)

In order to test the notification functionality, you can use the "[webhook.site](https://webhook.site/)".
This is a free website which allows you to view and debug callback/webhook HTTP POST requests.
With this service, requests are saved to a dedicated location for later review.
Please only use this service for this tutorial (or other non-production applications).

To use the webhook.site service with this tutorial, use a dedicated endpoint url generated for you after entering
the site. It should look similar to `https://webhook.site/efb19fb8-2579-4e1b-8614-d5a03edaaa7a`
Copy this URL, including the domain, into the exchange definition below.

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
                  "submission_requirements":[
                     {
                        "name":"Consent and Resident-card Exchange",
                        "rule":"pick",
                        "min":2,
                        "from":"A"
                     }
                  ],
                  "input_descriptors":[
                     {
                        "id":"PermanentResidentCard",
                        "name":"PermanentResidentCard",
                        "purpose":"PermanentResidentCard",
                        "group":[
                           "A"
                        ],
                        "constraints":{
                           "fields":[
                              {
                                 "path":[
                                    "$.type"
                                 ],
                                 "filter":{
                                    "type":"array",
                                    "contains":{
                                       "type":"string",
                                       "const":"PermanentResidentCard"
                                    }
                                 }
                              }
                           ]
                        }
                     },
                     {
                        "id":"ConsentCredential",
                        "name":"ConsentCredential",
                        "purpose":"One consent credential is required for this presentation",
                        "group":[
                           "A"
                        ],
                        "constraints":{
                           "subject_is_issuer":"required",
                           "fields":[
                              {
                                 "path":[
                                    "$.type"
                                 ],
                                 "filter":{
                                    "type":"array",
                                    "contains":{
                                       "type":"string",
                                       "const":"ConsentCredential"
                                    }
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
         "url":"FILL YOUR CALLBACK URL, for example 'https://webhook.site/efb19fb8-2579-4e1b-8614-d5a03edaaa7a'"
      }
   ]
}
```

**Expected Response HTTP Status Code**

`201 Created`

#### 2.2 [Verifier] Provide an exchange invitation to the resident

Having configured the exchange, the Verifier must then ask the resident to present the required credentials.

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

#### 2.3 [Resident] Initiate the presentation exchange

Initiate the credential exchange by POSTing to the `url` directly in Postman or by navigating to the `Vc Api Controller initiate Exchange` request in the collection.
Send the request as described below.

**Request URL**

If using the Postman collection request, fill in the `exchangeId` param to be the value used for the exchange Id by the Verifier.
`{VC API base url}/vc-api/exchanges/{exchange id}`

**HTTP Verb**

`POST`

**Request Body**

*empty*

**Sample Expected Response Body**

A similar json should be returned in the response body:
```json
{
  "vpRequest": {
    "challenge": "8e71f026-cf02-4a28-ba62-14eefa26c9d0",
    "query": [
      {
        "type": "PresentationDefinition",
        "credentialQuery": [
          {
            "presentationDefinition": {
              "id": "286bc1e0-f1bd-488a-a873-8d71be3c690e",
              "submission_requirements": [
                {
                  "name": "Consent and Resident-card Exchange",
                  "rule": "pick",
                  "min": 2,
                  "from": "A"
                }
              ],
              "input_descriptors": [
                {
                  "id": "PermanentResidentCard",
                  "name": "PermanentResidentCard",
                  "purpose": "PermanentResidentCard",
                  "group": [
                    "A"
                  ],
                  "constraints": {
                    "fields": [
                      {
                        "path": [
                          "$.type"
                        ],
                        "filter": {
                          "type": "array",
                          "contains": {
                            "type": "string",
                            "const": "PermanentResidentCard"
                          }
                        }
                      }
                    ]
                  }
                },
                {
                  "id": "ConsentCredential",
                  "name": "ConsentCredential",
                  "purpose": "One consent credential is required for this presentation",
                  "group": [
                    "A"
                  ],
                  "constraints": {
                    "subject_is_issuer": "required",
                    "fields": [
                      {
                        "path": [
                          "$.type"
                        ],
                        "filter": {
                          "type": "array",
                          "contains": {
                            "type": "string",
                            "const": "ConsentCredential"
                          }
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
          "serviceEndpoint": "https://vc-api-dev.energyweb.org/v1/vc-api/exchanges/b6754fca-f123-43ce-8bd2-92074f05a29b/25390400-e995-4f34-8f59-5820a8ce7816"
        }
      ]
    }
  },
  "processingInProgress": false
}
```
The `challenge` value and the final fragment of the `serviceEndpoint`, which is the `transaction id`, should be different.

The response contains a VP Request, which is a specification defined here: https://w3c-ccg.github.io/vp-request-spec/.
You can see that the VP Request's `query` section contains a `PresentationDefinition` query.
This means that the holder must provide credentials which satisfy the `presentationDefinition`.

Also note the `service` in the `interact` section of the VP Request.
This is providing the location at which we can continue the credential request flow once we have met the `query` requirements.

**Expected Response HTTP Status Code**

`201 Created`

#### 2.4 [Resident] Issue a self-signed credential

The consenter/resident can sign the credential to create a self-signed verifiable credential with the required information requested by the verifier.

The consenter/resident should add the following fields to the credential received in the previous step:
- `issuer`: This should be the DID generated in a previous step
- `credential.credentialSubject.id`: This should be the DID generated in a previous step
- `issuanceDate`: This should be the date at which the credential is being issued

Send the request as described below.

**Request URL**

`{VC API base url}/v1/vc-api/credentials/issue`

**HTTP Verb**

`POST`

**Request Body**

```json
{
    "credential": {
        "@context": [
            "https://www.w3.org/2018/credentials/v1",
            {
                "elia": "https://www.eliagroup.eu/ld-context-2022#",
                "consent": "elia:consent"
            }
        ],
        "id": "urn:uuid:49f69fb8-f256-4b2e-b15d-c7ebec3a507e",
        "type": [
            "VerifiableCredential", "ConsentCredential"
        ],
        "credentialSubject": {
            "consent": "I consent to such and such",
            "id": "did:key:z6MksYhSPw2gUFQTr9YtLMSHRAVdXjLTyTwaRyxPprWLyZyd"
        },
        "issuer": "did:key:z6MksYhSPw2gUFQTr9YtLMSHRAVdXjLTyTwaRyxPprWLyZyd",
        "issuanceDate":"2022-10-03T12:19:52Z"
    },
    "options": {}
}
```

**Sample Expected Response Body**

```json
{
    "@context": [
        "https://www.w3.org/2018/credentials/v1",
        {
            "elia": "https://www.eliagroup.eu/ld-context-2022#",
            "consent": "elia:consent"
        }
    ],
    "id": "urn:uuid:49f69fb8-f256-4b2e-b15d-c7ebec3a507e",
    "type": [
        "VerifiableCredential", "ConsentCredential"
    ],
    "credentialSubject": {
        "id": "did:key:z6MksYhSPw2gUFQTr9YtLMSHRAVdXjLTyTwaRyxPprWLyZyd",
        "consent": "I consent to such and such"
    },
    "issuer": "did:key:z6MksYhSPw2gUFQTr9YtLMSHRAVdXjLTyTwaRyxPprWLyZyd",
    "issuanceDate": "2022-10-03T12:19:52Z",
    "proof": {
        "type": "Ed25519Signature2018",
        "proofPurpose": "assertionMethod",
        "verificationMethod": "did:key:z6MksYhSPw2gUFQTr9YtLMSHRAVdXjLTyTwaRyxPprWLyZyd#z6MksYhSPw2gUFQTr9YtLMSHRAVdXjLTyTwaRyxPprWLyZyd",
        "created": "2022-08-19T13:06:33.005Z",
        "jws": "eyJhbGciOiJFZERTQSIsImNyaXQiOlsiYjY0Il0sImI2NCI6ZmFsc2V9..6r3J6qIohC6NRdXiWYWdJz0igFV2f6WSnDIvqUDnM5Qy7vU8UugdlGJiJ4SleiiNs7Hk-jiRprDXaazKpSrbCw"
    }
}
```

**Expected Response HTTP Status Code**

`201 Created`
      
#### 2.5 [Resident] Create the required presentation

Open the `Vc Api Controller prove Presentation` request under the `vc-api/presentations/prove` folder.

Send the request as described below.

**Request URL**

`{VC API base url}/vc-api/presentations/prove`

**HTTP Verb**

`POST`

**Request Body**

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
            "<FILL WITH VC RECEIVED FROM AUTHORITY>",
            "<FILL WITH SIGNED CONSENT VC>"
        ],
        "holder": "<FILL WITH RESIDENT DID>"
    },
    "options": {
        "verificationMethod": "<FILL WITH RESIDENT DID VERIFICATION METHOD>",
        "proofPurpose": "authentication",
        "challenge": "<FILL WITH CHALLENGE FROM VP REQUEST>"
    }
}
```

For example, your filled json would look like:

```json
{
   "presentation":{
      "@context":[
         "https://www.w3.org/2018/credentials/v1",
         "https://www.w3.org/2018/credentials/examples/v1"
      ],
      "type":[
         "VerifiablePresentation"
      ],
      "verifiableCredential":[
         {
            "@context":[
               "https://www.w3.org/2018/credentials/v1",
               "https://w3id.org/citizenship/v1"
            ],
            "id":"https://issuer.oidp.uscis.gov/credentials/83627465",
            "type":[
               "VerifiableCredential",
               "PermanentResidentCard"
            ],
            "credentialSubject":{
               "id":"did:key:z6MkubKMuHzFUV7eQWSjmcZtaP3xYSawshTTNru6u3okh2nC",
               "givenName":"JOHN",
               "image":"data:image/png;base64,iVBORw0KGgo...kJggg==",
               "familyName":"SMITH",
               "birthCountry":"Bahamas",
               "birthDate":"1958-07-17",
               "commuterClassification":"C1",
               "type":[
                  "PermanentResident",
                  "Person"
               ],
               "gender":"Male",
               "lprNumber":"999-999-999",
               "lprCategory":"C09",
               "residentSince":"2015-01-01"
            },
            "issuer":"did:key:z6Mkw22MoJQj8pKPS3F8Pce2e4kjatqqnvVbVRtDz94QNZdJ",
            "issuanceDate":"2019-12-03T12:19:52Z",
            "proof":{
               "type":"Ed25519Signature2018",
               "proofPurpose":"assertionMethod",
               "verificationMethod":"did:key:z6Mkw22MoJQj8pKPS3F8Pce2e4kjatqqnvVbVRtDz94QNZdJ#z6Mkw22MoJQj8pKPS3F8Pce2e4kjatqqnvVbVRtDz94QNZdJ",
               "created":"2023-01-30T08:26:13.729Z",
               "jws":"eyJhbGciOiJFZERTQSIsImNyaXQiOlsiYjY0Il0sImI2NCI6ZmFsc2V9..ZeGf6he4E9NU0mU5pDYuIuAw18EL_ztsV9hPFwCpefD0A82xD0JkkTpqPRp63M3SfCfaKzvYHFs4IHzCwS-vBw"
            },
            "expirationDate":"2029-12-03T12:19:52Z"
         },
         {
            "@context":[
               "https://www.w3.org/2018/credentials/v1",
               {
                  "consent":"elia:consent",
                  "elia":"https://www.eliagroup.eu/ld-context-2022#"
               }
            ],
            "id":"urn:uuid:49f69fb8-f256-4b2e-b15d-c7ebec3a507e",
            "type":[
               "VerifiableCredential",
               "ConsentCredential"
            ],
            "credentialSubject":{
               "id":"did:key:z6MkubKMuHzFUV7eQWSjmcZtaP3xYSawshTTNru6u3okh2nC",
               "consent":"I consent to such and such"
            },
            "issuer":"did:key:z6MkubKMuHzFUV7eQWSjmcZtaP3xYSawshTTNru6u3okh2nC",
            "issuanceDate":"2022-10-03T12:19:52Z",
            "proof":{
               "type":"Ed25519Signature2018",
               "proofPurpose":"assertionMethod",
               "verificationMethod":"did:key:z6MkubKMuHzFUV7eQWSjmcZtaP3xYSawshTTNru6u3okh2nC#z6MkubKMuHzFUV7eQWSjmcZtaP3xYSawshTTNru6u3okh2nC",
               "created":"2023-01-30T08:56:32.115Z",
               "jws":"eyJhbGciOiJFZERTQSIsImNyaXQiOlsiYjY0Il0sImI2NCI6ZmFsc2V9..PqFLOLLcxayOCJrNVtu3WOEgJJEd9ErR9zIaX62R_r0IEAQHcCYALv-cmmvs6KRClaGeijZi8AxBrbChUztPCw"
            }
         }
      ],
      "holder":"did:key:z6MkubKMuHzFUV7eQWSjmcZtaP3xYSawshTTNru6u3okh2nC"
   },
   "options":{
      "verificationMethod":"did:key:z6MkubKMuHzFUV7eQWSjmcZtaP3xYSawshTTNru6u3okh2nC#z6MkubKMuHzFUV7eQWSjmcZtaP3xYSawshTTNru6u3okh2nC",
      "proofPurpose":"authentication",
      "challenge":"8e71f026-cf02-4a28-ba62-14eefa26c9d0"
   }
}
```

**Sample Expected Response Body**

The response should be a verifiable presentation, similar to the one below.
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
        "https://w3id.org/citizenship/v1"
      ],
      "id": "https://issuer.oidp.uscis.gov/credentials/83627465",
      "type": [
        "VerifiableCredential",
        "PermanentResidentCard"
      ],
      "credentialSubject": {
        "id": "did:key:z6MkubKMuHzFUV7eQWSjmcZtaP3xYSawshTTNru6u3okh2nC",
        "commuterClassification": "C1",
        "givenName": "JOHN",
        "image": "data:image/png;base64,iVBORw0KGgo...kJggg==",
        "type": [
          "PermanentResident",
          "Person"
        ],
        "familyName": "SMITH",
        "birthDate": "1958-07-17",
        "gender": "Male",
        "lprCategory": "C09",
        "lprNumber": "999-999-999",
        "residentSince": "2015-01-01",
        "birthCountry": "Bahamas"
      },
      "issuer": "did:key:z6Mkw22MoJQj8pKPS3F8Pce2e4kjatqqnvVbVRtDz94QNZdJ",
      "issuanceDate": "2019-12-03T12:19:52Z",
      "proof": {
        "type": "Ed25519Signature2018",
        "proofPurpose": "assertionMethod",
        "verificationMethod": "did:key:z6Mkw22MoJQj8pKPS3F8Pce2e4kjatqqnvVbVRtDz94QNZdJ#z6Mkw22MoJQj8pKPS3F8Pce2e4kjatqqnvVbVRtDz94QNZdJ",
        "created": "2023-01-30T08:26:13.729Z",
        "jws": "eyJhbGciOiJFZERTQSIsImNyaXQiOlsiYjY0Il0sImI2NCI6ZmFsc2V9..ZeGf6he4E9NU0mU5pDYuIuAw18EL_ztsV9hPFwCpefD0A82xD0JkkTpqPRp63M3SfCfaKzvYHFs4IHzCwS-vBw"
      },
      "expirationDate": "2029-12-03T12:19:52Z"
    },
    {
      "@context": [
        "https://www.w3.org/2018/credentials/v1",
        {
          "consent": "elia:consent",
          "elia": "https://www.eliagroup.eu/ld-context-2022#"
        }
      ],
      "id": "urn:uuid:49f69fb8-f256-4b2e-b15d-c7ebec3a507e",
      "type": [
        "VerifiableCredential",
        "ConsentCredential"
      ],
      "credentialSubject": {
        "id": "did:key:z6MkubKMuHzFUV7eQWSjmcZtaP3xYSawshTTNru6u3okh2nC",
        "consent": "I consent to such and such"
      },
      "issuer": "did:key:z6MkubKMuHzFUV7eQWSjmcZtaP3xYSawshTTNru6u3okh2nC",
      "issuanceDate": "2022-10-03T12:19:52Z",
      "proof": {
        "type": "Ed25519Signature2018",
        "proofPurpose": "assertionMethod",
        "verificationMethod": "did:key:z6MkubKMuHzFUV7eQWSjmcZtaP3xYSawshTTNru6u3okh2nC#z6MkubKMuHzFUV7eQWSjmcZtaP3xYSawshTTNru6u3okh2nC",
        "created": "2023-01-30T08:56:32.115Z",
        "jws": "eyJhbGciOiJFZERTQSIsImNyaXQiOlsiYjY0Il0sImI2NCI6ZmFsc2V9..PqFLOLLcxayOCJrNVtu3WOEgJJEd9ErR9zIaX62R_r0IEAQHcCYALv-cmmvs6KRClaGeijZi8AxBrbChUztPCw"
      }
    }
  ],
  "proof": {
    "type": "Ed25519Signature2018",
    "proofPurpose": "authentication",
    "challenge": "8e71f026-cf02-4a28-ba62-14eefa26c9d0",
    "verificationMethod": "did:key:z6MkubKMuHzFUV7eQWSjmcZtaP3xYSawshTTNru6u3okh2nC#z6MkubKMuHzFUV7eQWSjmcZtaP3xYSawshTTNru6u3okh2nC",
    "created": "2023-02-07T05:47:47.304Z",
    "jws": "eyJhbGciOiJFZERTQSIsImNyaXQiOlsiYjY0Il0sImI2NCI6ZmFsc2V9..tCIS0gexf5g6CyweXFyQAUtgWm8nrKq0cpFW6Bc_Mnxic_dFEnby-KJhBn9aWEwExmDFLvZRHogvBsLTNaQsDQ"
  },
  "holder": "did:key:z6MkubKMuHzFUV7eQWSjmcZtaP3xYSawshTTNru6u3okh2nC"
}
```

**Expected Response HTTP Status Code**

`201 Created`

#### 2.6 [Resident] Continue the exchange

Continue the exchange by sending the VP in response to the VP Request that was previously received.
Open the `Vc Api Controller continue Exchange` request in the `vc-api/exchanges/{exchange Id}` folder.

Send the request as described below.

**Request URL**

In the request params, use the `transactionId` and `exchangeId` from the `serviceEndpoint` in the VP Request.

`{VC API base url}/vc-api/exchanges/{exchangeId}/{transactionId}`

**HTTP Verb**

`PUT`

**Request Body**

In the request body, copy the VP that was obtained from the previous step.

**Expected Response HTTP Status Code**

`200 OK`

#### 2.7 [Verifier] Act on Submitted Presentation

For reference, the callback notification that would have been received in a configured callback for this presentation would be:

```json
{
  "transactionId": "25390400-e995-4f34-8f59-5820a8ce7816",
  "exchangeId": "b6754fca-f123-43ce-8bd2-92074f05a29b",
  "vpRequest": {
    "challenge": "8e71f026-cf02-4a28-ba62-14eefa26c9d0",
    "query": [
      {
        "type": "PresentationDefinition",
        "credentialQuery": [
          {
            "presentationDefinition": {
              "id": "286bc1e0-f1bd-488a-a873-8d71be3c690e",
              "input_descriptors": [
                {
                  "id": "PermanentResidentCard",
                  "name": "PermanentResidentCard",
                  "purpose": "PermanentResidentCard",
                  "group": [
                    "A"
                  ],
                  "constraints": {
                    "fields": [
                      {
                        "path": [
                          "$.type"
                        ],
                        "filter": {
                          "type": "array",
                          "contains": {
                            "type": "string",
                            "const": "PermanentResidentCard"
                          }
                        }
                      }
                    ]
                  }
                },
                {
                  "id": "ConsentCredential",
                  "name": "ConsentCredential",
                  "purpose": "One consent credential is required for this presentation",
                  "group": [
                    "A"
                  ],
                  "constraints": {
                    "subject_is_issuer": "required",
                    "fields": [
                      {
                        "path": [
                          "$.type"
                        ],
                        "filter": {
                          "type": "array",
                          "contains": {
                            "type": "string",
                            "const": "ConsentCredential"
                          }
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
          "serviceEndpoint": "https://vc-api-dev.energyweb.org/v1/vc-api/exchanges/b6754fca-f123-43ce-8bd2-92074f05a29b/25390400-e995-4f34-8f59-5820a8ce7816"
        }
      ]
    }
  },
  "presentationSubmission": {
    "verificationResult": {
      "errors": [],
      "checks": [
        "proof"
      ],
      "warnings": []
    },
    "vp": {
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
            "https://w3id.org/citizenship/v1"
          ],
          "id": "https://issuer.oidp.uscis.gov/credentials/83627465",
          "type": [
            "VerifiableCredential",
            "PermanentResidentCard"
          ],
          "credentialSubject": {
            "id": "did:key:z6MkubKMuHzFUV7eQWSjmcZtaP3xYSawshTTNru6u3okh2nC",
            "commuterClassification": "C1",
            "givenName": "JOHN",
            "image": "data:image/png;base64,iVBORw0KGgo...kJggg==",
            "type": [
              "PermanentResident",
              "Person"
            ],
            "familyName": "SMITH",
            "birthDate": "1958-07-17",
            "gender": "Male",
            "lprCategory": "C09",
            "lprNumber": "999-999-999",
            "residentSince": "2015-01-01",
            "birthCountry": "Bahamas"
          },
          "issuer": "did:key:z6Mkw22MoJQj8pKPS3F8Pce2e4kjatqqnvVbVRtDz94QNZdJ",
          "issuanceDate": "2019-12-03T12:19:52Z",
          "proof": {
            "type": "Ed25519Signature2018",
            "proofPurpose": "assertionMethod",
            "verificationMethod": "did:key:z6Mkw22MoJQj8pKPS3F8Pce2e4kjatqqnvVbVRtDz94QNZdJ#z6Mkw22MoJQj8pKPS3F8Pce2e4kjatqqnvVbVRtDz94QNZdJ",
            "created": "2023-01-30T08:26:13.729Z",
            "jws": "eyJhbGciOiJFZERTQSIsImNyaXQiOlsiYjY0Il0sImI2NCI6ZmFsc2V9..ZeGf6he4E9NU0mU5pDYuIuAw18EL_ztsV9hPFwCpefD0A82xD0JkkTpqPRp63M3SfCfaKzvYHFs4IHzCwS-vBw"
          },
          "expirationDate": "2029-12-03T12:19:52Z"
        },
        {
          "@context": [
            "https://www.w3.org/2018/credentials/v1",
            {
              "consent": "elia:consent",
              "elia": "https://www.eliagroup.eu/ld-context-2022#"
            }
          ],
          "id": "urn:uuid:49f69fb8-f256-4b2e-b15d-c7ebec3a507e",
          "type": [
            "VerifiableCredential",
            "ConsentCredential"
          ],
          "credentialSubject": {
            "id": "did:key:z6MkubKMuHzFUV7eQWSjmcZtaP3xYSawshTTNru6u3okh2nC",
            "consent": "I consent to such and such"
          },
          "issuer": "did:key:z6MkubKMuHzFUV7eQWSjmcZtaP3xYSawshTTNru6u3okh2nC",
          "issuanceDate": "2022-10-03T12:19:52Z",
          "proof": {
            "type": "Ed25519Signature2018",
            "proofPurpose": "assertionMethod",
            "verificationMethod": "did:key:z6MkubKMuHzFUV7eQWSjmcZtaP3xYSawshTTNru6u3okh2nC#z6MkubKMuHzFUV7eQWSjmcZtaP3xYSawshTTNru6u3okh2nC",
            "created": "2023-01-30T08:56:32.115Z",
            "jws": "eyJhbGciOiJFZERTQSIsImNyaXQiOlsiYjY0Il0sImI2NCI6ZmFsc2V9..PqFLOLLcxayOCJrNVtu3WOEgJJEd9ErR9zIaX62R_r0IEAQHcCYALv-cmmvs6KRClaGeijZi8AxBrbChUztPCw"
          }
        }
      ],
      "proof": {
        "type": "Ed25519Signature2018",
        "proofPurpose": "authentication",
        "challenge": "8e71f026-cf02-4a28-ba62-14eefa26c9d0",
        "verificationMethod": "did:key:z6MkubKMuHzFUV7eQWSjmcZtaP3xYSawshTTNru6u3okh2nC#z6MkubKMuHzFUV7eQWSjmcZtaP3xYSawshTTNru6u3okh2nC",
        "created": "2023-02-07T05:47:47.304Z",
        "jws": "eyJhbGciOiJFZERTQSIsImNyaXQiOlsiYjY0Il0sImI2NCI6ZmFsc2V9..tCIS0gexf5g6CyweXFyQAUtgWm8nrKq0cpFW6Bc_Mnxic_dFEnby-KJhBn9aWEwExmDFLvZRHogvBsLTNaQsDQ"
      },
      "holder": "did:key:z6MkubKMuHzFUV7eQWSjmcZtaP3xYSawshTTNru6u3okh2nC"
    }
  }
}
```