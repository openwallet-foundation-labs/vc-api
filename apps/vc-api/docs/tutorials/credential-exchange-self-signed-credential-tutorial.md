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

# Consent Tutorial

## Business overview
The business objective of this tutorial is to demonstrate request signed consent from a DID in the form of a Verifiable Credential (VC).

### Business workflows
TODO. See [business workflows from resident-card tutorial](./resident-card-tutorial.md#business-workflows)

## Technical overview
From a technical point of view, in this tutorial, we have access to the server API but no mobile wallet is available. So we will use the server API for both roles of the portal and the consent providers's mobile wallet.

### Technical workflows

The technical workflow is as follows:
- [1 [Consent-Requesting portal] Configure the consent request exchange](#1-consent-requesting-portal-configure-the-consent-request-exchange)
- [2 [Consent-Requesting portal] Provide an exchange invitation to the consenter](#2-consent-requesting-portal-provide-an-exchange-invitation-to-the-consenter)
- [3 [Consenter] Initiate issuance exchange using the request URL](#3-consenter-initiate-issuance-exchange-using-the-request-url)
- [4 [Consenter] Create a DID](#4-consenter-create-a-did)
- [5 [Consenter] Convert the input descriptor to a credential](#5-consenter-convert-the-input-descriptor-to-a-credential)
- [6 [Consenter] Issue a self-signed credential](#6-consenter-issue-a-self-signed-credential)
- [7 [Consenter] Create a presentation with the self-signed credential](#7-consenter-create-a-presentation-with-the-self-signed-credential)
- [8 [Consenter] Continue exchange by submitting the presentation](#8-consenter-continue-exchange-by-submitting-the-presentation)

## Steps
### 0. Setup the Postman Collection

First, download and install [Postman](https://www.postman.com/downloads/).

Then, from the Postman app, import the following API definitions:
- [VC-API open-api json](../openapi.json)
- [Input-descriptor-to-credential](../../../input-descriptor-to-credential/docs/openapi.json)

Then, import [the environment](../vc-api.postman_environment.json) for VC-API.

Instructions on how to import into Postman can be found [here](https://learning.postman.com/docs/getting-started/importing-and-exporting-data/#importing-data-into-postman).

### 1 [Consent-Requesting portal] Configure the consent request exchange

The consent-requesting portal needs to configure the parameters of the consent exchange by sending an [Exchange Definition](../exchanges.md#exchange-definitions).
To do this, navigate to the `Vc Api Controller create Exchange` under `vc-api/exchanges` and send the request described below.

**Request URL**

`{VC API base url}/v1/vc-api/exchanges`

**HTTP Verb**

`POST`

**Request Body**

Fill in the `exchangeId` with a unique id, such as a [UUID](https://en.wikipedia.org/wiki/Universally_unique_identifier).

Note the `interactService` `type` of `UnmediatedHttpPresentationService2021`.
See the [exchanges documentation](../exchanges.md#unmediated-exchange-interactions) for information about mediated exchanges.

In order to test the notification functionality, you can use the "[webhook.site](https://webhook.site/)".
This is a free website which allows you to view and debug callback/webhook HTTP POST requests.
With this service, requests are saved to a dedicated location for later review.
Please only use this service for this tutorial (or other non-production applications).

To use the webhook.site service with this tutorial, use a dedicated endpoint url generated for you after entering 
the site. It should look similar to `https://webhook.site/efb19fb8-2579-4e1b-8614-d5a03edaaa7a`
Copy this URL, including the domain, into the exchange definition below.

For further documentation regarding the `presentationDefinition`, can be seen [here](../exchanges.md#presentation-definition-queries)

```json
{
    "exchangeId": "<FILL WITH SOME UNIQUE ID>",
    "query": [
      {
         "type":"PresentationDefinition",
         "credentialQuery":[
            {
               "presentationDefinition":{
                    "id":"286bc1e0-f1bd-488a-a873-8d71be3c690e",
                    "input_descriptors":[
                        {
                          "id": "consent_agreement",
                          "name": "Consent Agreement",
                          "constraints": {
                            "subject_is_issuer":"required",
                            "fields":[
                                {
                                  "path":["$.id"],
                                  "filter":{
                                    "const":"urn:uuid:49f69fb8-f256-4b2e-b15d-c7ebec3a507e"
                                  }
                                },
                                {
                                  "path":["$.@context"],
                                  "filter":{
                                      "$schema":"http://json-schema.org/draft-07/schema#",
                                      "type":"array",
                                      "items":[
                                        {
                                            "const":"https://www.w3.org/2018/credentials/v1"
                                        },
                                        {
                                            "$ref":"#/definitions/eliaGroupContext"
                                        }
                                      ],
                                      "additionalItems":false,
                                      "minItems":2,
                                      "maxItems":2,
                                      "definitions":{
                                        "eliaGroupContext":{
                                            "type":"object",
                                            "properties":{
                                              "elia":{
                                                  "const":"https://www.eliagroup.eu/ld-context-2022#"
                                              },
                                              "consent":{
                                                  "const":"elia:consent"
                                              },
                                              "ConsentCredential":{
                                                "const":"elia:ConsentCredential"
                                             }
                                            },
                                            "additionalProperties":false,
                                            "required":[
                                              "elia",
                                              "consent"
                                            ]
                                        }
                                      }
                                  }
                                },
                                {
                                  "path":["$.credentialSubject"],
                                  "filter":{
                                      "type":"object",
                                      "properties":{
                                        "consent":{
                                            "const":"I consent to such and such"
                                        }
                                      },
                                      "additionalProperties":true
                                  }
                                },
                                {
                                  "path":["$.type"],
                                  "filter":{
                                      "type":"array",
                                      "items":[
                                          {
                                            "const":"VerifiableCredential"
                                          },
                                          {
                                            "const":"ConsentCredential"
                                          }
                                      ]
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
    "interactServices": [
      {
        "type": "UnmediatedHttpPresentationService2021"
      }
    ],
    "callback": [
      {
        "url": "FILL YOUR CALLBACK URL, for example 'https://webhook.site/efb19fb8-2579-4e1b-8614-d5a03edaaa7a'"
      }
    ],
    "isOneTime":true
}
```

**Expected Response HTTP Status Code**

`201 Created`

### 2 [Consent-Requesting portal] Provide an exchange invitation to the consenter

The consent-requesting portal can communicate to the consenter that they can initiate request for a "PermanentConsenterCard" credential by
filling the `exchange id` in the json template below and transmitting the json to the consenter.
They can do this transmission by encoding the json in a QR code and displaying to the consenter for example.

```json
{
    "outOfBandInvitation": { 
        "type": "https://energyweb.org/out-of-band-invitation/vc-api-exchange",
        "body": { 
            "url": "{VC API base url}/v1/vc-api/exchanges/{THE EXCHANGE ID FROM THE PREVIOUS STEP}" 
        }
    }
} 
```

### 3 [Consenter] Initiate issuance exchange using the request URL

Initiate a request for a PermanentConsenterCard by POSTing to the `url` directly in Postman or by navigating to the `Vc Api Controller initiate Exchange` request in the collection.

Send the request as described below.

**Request URL**

If using the collection request, fill in the `exchangeid` param to be the exchange ID used in the first step.
`{VC API base url}/v1/vc-api/exchanges/{exchangeId}`

**HTTP Verb**

`POST`

**Request Body**

*empty*

**Sample Expected Response Body**

The response contains a VP Request, which is a specification defined here: https://w3c-ccg.github.io/vp-request-spec/.
You can see that the VP Request's `query` section contains a `PresentationDefinition` `credentialQuery`.
This presentation definition requests a self-signed credential (via the `subject_is_issuer` property).

The `challenge` value and the final fragment of the `serviceEndpoint`, which is the `transaction id`, should be different from the sample below.

Also note the `service` in the `interact` section of the VP Request.
This is providing the location at which we can continue the credential exchange once we have met the `query` requirements.

```json
{
  "vpRequest": {
    "challenge": "95bd296c-cb72-42aa-8199-1c39c7919aab",
    "query": [
      {
        "type": "PresentationDefinition",
        "credentialQuery": [
          {
            "presentationDefinition": {
              "id": "286bc1e0-f1bd-488a-a873-8d71be3c690e",
              "input_descriptors": [
                {
                  "id": "consent_agreement",
                  "name": "Consent Agreement",
                  "constraints": {
                    "subject_is_issuer": "required",
                    "fields": [
                      {
                        "path": [
                          "$.id"
                        ],
                        "filter": {
                          "const": "urn:uuid:49f69fb8-f256-4b2e-b15d-c7ebec3a507e"
                        }
                      },
                      {
                        "path": [
                          "$.@context"
                        ],
                        "filter": {
                          "$schema": "http://json-schema.org/draft-07/schema#",
                          "type": "array",
                          "items": [
                            {
                              "const": "https://www.w3.org/2018/credentials/v1"
                            },
                            {
                              "$ref": "#/definitions/eliaGroupContext"
                            }
                          ],
                          "additionalItems": false,
                          "minItems": 2,
                          "maxItems": 2,
                          "definitions": {
                            "eliaGroupContext": {
                              "type": "object",
                              "properties": {
                                "elia": {
                                  "const": "https://www.eliagroup.eu/ld-context-2022#"
                                },
                                "consent": {
                                  "const": "elia:consent"
                                },
                                "ConsentCredential": {
                                  "const": "elia:ConsentCredential"
                                }
                              },
                              "additionalProperties": false,
                              "required": [
                                "elia",
                                "consent"
                              ]
                            }
                          }
                        }
                      },
                      {
                        "path": [
                          "$.credentialSubject"
                        ],
                        "filter": {
                          "type": "object",
                          "properties": {
                            "consent": {
                              "const": "I consent to such and such"
                            }
                          },
                          "additionalProperties": true
                        }
                      },
                      {
                        "path": [
                          "$.type"
                        ],
                        "filter": {
                          "type": "array",
                          "items": [
                            {
                              "const": "VerifiableCredential"
                            },
                            {
                              "const": "ConsentCredential"
                            }
                          ]
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
          "serviceEndpoint": "https://vc-api-dev.energyweb.org/v1/vc-api/exchanges/5fdb1a29-2dba-4550-b184-18ade4216d80/b4a2d3a8-9ad4-473c-ba2b-10423224e9d2"
        }
      ]
    }
  },
  "processingInProgress": false
}
```

**Expected Response HTTP Status Code**

`201 Created`

### 4 [Consenter] Create a DID

Let's create a new DID for which the consenter can prove control.
This DID will be the Subject identifier of the Consenter Card credential.

Navigate to the `DID Controller create` request under the `did` folder.

Send the request as described below.

**Request URL**

`{VC API base url}/v1/did`

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
  "id": "did:key:z6MkfGg96cNEL2Ne4z9HD3BSQhhD2neZKTzyE1y5wUu9KM4h",
  "verificationMethod": [
    {
      "id": "did:key:z6MkfGg96cNEL2Ne4z9HD3BSQhhD2neZKTzyE1y5wUu9KM4h#z6MkfGg96cNEL2Ne4z9HD3BSQhhD2neZKTzyE1y5wUu9KM4h",
      "type": "Ed25519VerificationKey2018",
      "controller": "did:key:z6MkfGg96cNEL2Ne4z9HD3BSQhhD2neZKTzyE1y5wUu9KM4h",
      "publicKeyJwk": {
        "crv": "Ed25519",
        "x": "DCWK0WAJnFk3dS4-pMeK31t8JYEA7GXECqTNjO0UxzY",
        "kty": "OKP",
        "kid": "Na841vz9DxcXNVE5Ac6t359uf2ROCiB4Tkc9kS5k3R4"
      }
    }
  ]
}
```

**Expected Response HTTP Status Code**

`201 Created`

### 5 [Consenter] Convert the input descriptor to a credential

In order to fulfil the consent request, the consenter can issue themselves a credential.
However, the consent request is given as a JSON Schema which describes a credential, not a credential itself.
The [Credential from Input Descriptor service](../../../input-descriptor-to-credential/) can be used to convert an input descriptor to a credential which can then be self-signed.

This can be done by providing the `constraints` object from the input descriptor received when initiating the exchange.

Open the `Converter Controller input Descriptor To Credential` request in the "Input Descriptor to Credential" collection.
**Change `{{baseUrl}}` to `{{idcUrl}}` in the request URL**, so that it matches the Postman environment.

**Note** `additionalProperties: true` in the `$.credentialSubject` filter should be changed to `false`.
It is required to be true in the presentation definition as `id` must be added during credential issuance.
However, if set to `true` during credential generation, then the `input-descriptor-to-credential` will add additional unnecessary data. 

Send the request as described below.

**Request URL**

`{Input-Descriptor-To-Credential base url}/converter/input-descriptor-to-credential`

**HTTP Verb**

`POST`

**Request Body**

```json
{
   "constraints": {
      "subject_is_issuer": "required",
      "fields": [
          {
              "path": [
                  "$.id"
              ],
              "filter": {
                  "const": "urn:uuid:49f69fb8-f256-4b2e-b15d-c7ebec3a507e"
              }
          },
          {
              "path": [
                  "$.@context"
              ],
              "filter": {
                  "$schema": "http://json-schema.org/draft-07/schema#",
                  "type": "array",
                  "items": [
                      {
                          "const": "https://www.w3.org/2018/credentials/v1"
                      },
                      {
                          "$ref": "#/definitions/eliaGroupContext"
                      }
                  ],
                  "additionalItems": false,
                  "minItems": 2,
                  "maxItems": 2,
                  "definitions": {
                      "eliaGroupContext": {
                          "type": "object",
                          "properties": {
                              "elia": {
                                  "const": "https://www.eliagroup.eu/ld-context-2022#"
                              },
                              "consent": {
                                  "const": "elia:consent"
                              },
                              "ConsentCredential":{
                                  "const":"elia:ConsentCredential"
                              }
                          },
                          "additionalProperties": false,
                          "required": [
                              "elia",
                              "consent"
                          ]
                      }
                  }
              }
          },
          {
              "path": [
                  "$.credentialSubject"
              ],
              "filter": {
                  "type": "object",
                  "properties": {
                      "consent": {
                          "const": "I consent to such and such"
                      }
                  },
                  "additionalProperties": true
              }
          },
          {
              "path": [
                  "$.type"
              ],
              "filter": {
                  "type": "array",
                  "items": [
                      {
                          "const": "VerifiableCredential"
                      },
                      {
                          "const": "ConsentCredential"
                      }
                  ]
              }
          }
      ]
  }
}
```

**Sample Expected Response Body**

```json
{
    "credential": {
        "id": "urn:uuid:49f69fb8-f256-4b2e-b15d-c7ebec3a507e",
        "@context": [
            "https://www.w3.org/2018/credentials/v1",
            {
                "elia": "https://www.eliagroup.eu/ld-context-2022#",
                "consent": "elia:consent",
                "ConsentCredential": "elia:ConsentCredential"
            }
        ],
        "credentialSubject": {
            "consent": "I consent to such and such"
        },
        "type": [
            "VerifiableCredential", 
            "ConsentCredential"
        ]
    }
}
```

**Expected Response HTTP Status Code**

`201 Created`

### 6 [Consenter] Issue a self-signed credential

The consenter can now sign the credential to create a self-signed verifiable credential.
The consenter should add the following fields to the credential received in the previous step:
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
                "consent": "elia:consent",
                "ConsentCredential": "elia:ConsentCredential"
            }
        ],
        "id": "urn:uuid:49f69fb8-f256-4b2e-b15d-c7ebec3a507e",
        "type": [
            "VerifiableCredential", "ConsentCredential"
        ],
        "credentialSubject": {
            "consent": "I consent to such and such",
            "id": "did:key:z6MkfGg96cNEL2Ne4z9HD3BSQhhD2neZKTzyE1y5wUu9KM4h"
        },
        "issuer": "did:key:z6MkfGg96cNEL2Ne4z9HD3BSQhhD2neZKTzyE1y5wUu9KM4h",
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
      "ConsentCredential": "elia:ConsentCredential",
      "consent": "elia:consent"
    }
  ],
  "id": "urn:uuid:49f69fb8-f256-4b2e-b15d-c7ebec3a507e",
  "type": [
    "VerifiableCredential",
    "ConsentCredential"
  ],
  "credentialSubject": {
    "id": "did:key:z6MkfGg96cNEL2Ne4z9HD3BSQhhD2neZKTzyE1y5wUu9KM4h",
    "consent": "I consent to such and such"
  },
  "issuer": "did:key:z6MkfGg96cNEL2Ne4z9HD3BSQhhD2neZKTzyE1y5wUu9KM4h",
  "issuanceDate": "2022-10-03T12:19:52Z",
  "proof": {
    "type": "Ed25519Signature2018",
    "proofPurpose": "assertionMethod",
    "verificationMethod": "did:key:z6MkfGg96cNEL2Ne4z9HD3BSQhhD2neZKTzyE1y5wUu9KM4h#z6MkfGg96cNEL2Ne4z9HD3BSQhhD2neZKTzyE1y5wUu9KM4h",
    "created": "2023-04-19T06:53:23.529Z",
    "jws": "eyJhbGciOiJFZERTQSIsImNyaXQiOlsiYjY0Il0sImI2NCI6ZmFsc2V9..z40JNjtVufTUCgUQxuuGuQZMXRTcQcjvav0QuyuXvsq8nEy2UJ7ovfOCsTww5UtQ9fZkXukokySUb1HdzeTVDA"
  }
}
```

**Expected Response HTTP Status Code**

`201 Created`

### 7 [Consenter] Create a presentation with the self-signed credential

The consenter can now create a verifiable presentation for submission.

Send the request as described below.

**Request URL**

`{VC API base url}/v1/vc-api/presentations/prove`

**HTTP Verb**

`POST`

**Request Body**

In the request body, use the following json, filled with your own values.
The `challenge` should be value received from the VP Request obtained when initiating the exchange.

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
            "<FILL WITH VC ISSUED IN PREVIOUS STEP>"
        ],
        "holder": "<FILL WITH CONSENTER DID>"
    },
    "options": {
        "verificationMethod": "<FILL WITH CONSENTER VERIFICATIONMETHOD ID>",
        "proofPurpose": "authentication",
        "challenge": "<FILL WITH CHALLENGE FROM VP REQUEST>"
    }
}
```

**Sample Expected Response Body**

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
          "consent": "elia:consent",
          "ConsentCredential": "elia:ConsentCredential",
          "elia": "https://www.eliagroup.eu/ld-context-2022#"
        }
      ],
      "id": "urn:uuid:49f69fb8-f256-4b2e-b15d-c7ebec3a507e",
      "type": [
        "VerifiableCredential",
        "ConsentCredential"
      ],
      "credentialSubject": {
        "id": "did:key:z6MkfGg96cNEL2Ne4z9HD3BSQhhD2neZKTzyE1y5wUu9KM4h",
        "consent": "I consent to such and such"
      },
      "issuer": "did:key:z6MkfGg96cNEL2Ne4z9HD3BSQhhD2neZKTzyE1y5wUu9KM4h",
      "issuanceDate": "2022-10-03T12:19:52Z",
      "proof": {
        "type": "Ed25519Signature2018",
        "proofPurpose": "assertionMethod",
        "verificationMethod": "did:key:z6MkfGg96cNEL2Ne4z9HD3BSQhhD2neZKTzyE1y5wUu9KM4h#z6MkfGg96cNEL2Ne4z9HD3BSQhhD2neZKTzyE1y5wUu9KM4h",
        "created": "2023-04-19T06:53:23.529Z",
        "jws": "eyJhbGciOiJFZERTQSIsImNyaXQiOlsiYjY0Il0sImI2NCI6ZmFsc2V9..z40JNjtVufTUCgUQxuuGuQZMXRTcQcjvav0QuyuXvsq8nEy2UJ7ovfOCsTww5UtQ9fZkXukokySUb1HdzeTVDA"
      }
    }
  ],
  "proof": {
    "type": "Ed25519Signature2018",
    "proofPurpose": "authentication",
    "challenge": "95bd296c-cb72-42aa-8199-1c39c7919aab",
    "verificationMethod": "did:key:z6MkfGg96cNEL2Ne4z9HD3BSQhhD2neZKTzyE1y5wUu9KM4h#z6MkfGg96cNEL2Ne4z9HD3BSQhhD2neZKTzyE1y5wUu9KM4h",
    "created": "2023-04-19T07:04:11.810Z",
    "jws": "eyJhbGciOiJFZERTQSIsImNyaXQiOlsiYjY0Il0sImI2NCI6ZmFsc2V9..4iecLbfVwoXRH26IKTKdFIzRmIV9mL8OK9QIeOpp7e6ZsTtR9lrm-NvukKE316LY3gZMZmOzfi_fJQLP3KIaCQ"
  },
  "holder": "did:key:z6MkfGg96cNEL2Ne4z9HD3BSQhhD2neZKTzyE1y5wUu9KM4h"
}
```

**Expected Response HTTP Status Code**

`201 Created`

### 8 [Consenter] Continue exchange by submitting the presentation

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

**Sample Expected Response Body**

```json
{
    "processingInProgress": false
}
```

**Expected Response HTTP Status Code**

`200 OK`
