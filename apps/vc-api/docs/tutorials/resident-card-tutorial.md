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

## Business overview
The business objective of this tutorial is to demonstrate how to issue a Verifiable Credential (VC) to a known user connected to a portal that we will call "authority portal".
In the example below, we will issue a permanent residency card to a user we will call "resident". We use the context "https://w3id.org/residentship/v1" which describes the data of a VC of type "PermanentResidentCard".

Here is an extract of the context:

        ...
        "id": "@id",
        "type": "@type",

        "ctzn": "https://w3id.org/residentship#",
        "schema": "http://schema.org/",
        "xsd": "http://www.w3.org/2001/XMLSchema#",

        "birthCountry": "ctzn:birthCountry",
        "birthDate": {"@id": "schema:birthDate", "@type": "xsd:dateTime"},
        "commuterClassification": "ctzn:commuterClassification",
        "familyName": "schema:familyName",
        "gender": "schema:gender",
        "givenName": "schema:givenName",
        "lprCategory": "ctzn:lprCategory",
        "lprNumber": "ctzn:lprNumber",
        "residentSince": {"@id": "ctzn:residentSince", "@type": "xsd:dateTime"}
        ...

To get the definition of the field "gender" which points to the definition "schema:gender", use the URI of "schema" which points to "http://schema.org/", so we will have a definition available at "http://schema.org/gender".
Regarding the aliasing of `id` to `@id` and `type` to `@type`, see the [VC specification](https://www.w3.org/TR/vc-data-model/#syntactic-sugar).

We therefore assume that the resident is connected to the autority portal and that the information contained in the context about the resident is available in the autority portal database.

### Business workflows

#### Issuance Business workflow
1. The authority portal authenticates the current user as a known resident.
1. The resident requests a "PermanentResidentCard" credential on the autority portal.
1. The autority portal displays a QR code for the citizen to scan with his mobile wallet.
1. The citizen's mobile wallet provides the autority portal with a presentation to prove control over a DID.
1. The authority portal reviews the presentation and issues a "PermanentResidentCard" credential containing the resident's information.
1. The citizen's mobile wallet contacts the autority portal again to receive the "PermanentResidentCard".

#### Presentation Business workflow
1. The authority portal displays a QR code requesting a presentation containing the "PermanentResidentCard" credential
1. The resident scans the QR code with their mobile wallet and prompts the user for permission to present the "PermanentResidentCard" credential
1. The resident confirms and the presentation is submitted to the authority portal who can then authorize the resident

## Technical overview
From a technical point of view, in this tutorial, we have access to the server API but no mobile wallet is available. So we will use the server API for both roles of the portal and the resident's mobile wallet.

### Technical workflows

#### Issuance workflow
The technical issuance workflow is as follows:
- [Authority portal action] Configure a DID authentication exchange for the customer
- [Authority portal action] Transmit an exchange invitation to the citizen as a QR code or a deep link
- [Resident action] Request a credential using the request URL and obtain a [VP Request](https://w3c-ccg.github.io/vp-request-spec/) in return
- [Resident action] Create a DID for the resident using the "did:key" DID method
- [Resident action] Create an authentication proof (as a verfiable presentation) for the new DID
- [Resident action] Send the authentication proof to the authority portal exchange endpoint
- [Authority portal action] Create a DID for the authority portal using the "did:key" DID method
- [Authority portal action] Issue a "PermanentResidentCard" credential to the resident's DID
- [Authority portal action] Prove a presentation which contains the new "PermanentResidentCard" credential
- [Authority portal action] Add a review of the authentication proof which contains the "PermanentResidentCard" presentation
- [Resident action] Contact the exchange endpoint again to receive the presentation containing the "PermanentResidentCard" credential

#### Presentation workflow
- [Authority portal action] Configure a credential exchange which requests the "PermanentResidentCard" credential 
- [Authority portal action] Transmit an exchange invitation to the resident as a QR code or a deep link
- [Resident action] Initiate the exchange and obtain a [Verifiable Presentation Request](https://w3c-ccg.github.io/vp-request-spec/) in return
- [Resident action] Create a Verifiable Presentation which contains the "PermanentResidentCard" credential 
- [Resident action] Send the Verifiable Presentation to the authority portal

## Overview and Objective

The objective of this tutorial is walk through a simple credential issuance and presentation flow.
A diagram of this flow is available in the root README.

## Steps
### Setup the Postman Collection

First, download and install [Postman](https://www.postman.com/downloads/).

Then, from the Postman app, import [the open-api json](./open-api.json) and [the environment](./ewf-ssi-wallet.postman_environment.json) for the Nest.js wallet. Instructions on how to import into Postman can be found [here](https://learning.postman.com/docs/getting-started/importing-and-exporting-data/#importing-data-into-postman).

### Permanent Resident Card issuance

#### [Authority portal] Configure the credential issuance exchange

The authority portal needs to configure the parameters of the parameters of the permanent resident card issuance exchange.
To do this, navigate to the `Vc Api Controller create Exchange` under `vc-api/exchanges` and send with the json below.

For the [exchanges documentation](../exchanges.md#mediated-exchange-interactions) for information about mediated exchanges.

In order to test the notification functionality, you can use the "Post Test Server".
This is a free website which allows you to view sent HTTP POST requests.
With this service, requests are "dumped" to a "toilet" for later review.
Please only use this service for this tutorial (or other non-production applications).

To use the "Post Test Server" service with this tuorial, create a new "toilet" from the website home page.
Then, in the resulting page, copy the POST URL, including the domain, into the exchange definition below.
Creating a new "toilet" is to help you be sure that you are looking at the requests you have created.

```json
{
    "exchangeId": "resident-card-issuance",
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
        "url": "FILL YOUR TOILET POST URL, for example 'http://ptsv2.com/t/ebitx-1652373826/post'"
      }
    ]
}
```

The response should have a `201 Created` status code. 

### [Authority portal] Provide an exchange invitation to the citizen

The authority portal can communicate to the citizen that they can initiate request for a "PermanentResidentCard" credential by
providing them the json object below.
They can do this through a QR code for example.
Note that the `exchangeId` from the exchange creation is to be used as the last fragment of the url.

```json
{
    "outOfBandInvitation": { 
        "type": "https://energyweb.org/out-of-band-invitation/vc-api-exchange",
        "body": { 
            "credentialTypeAvailable": "PermanentResidentCard",
            "url": "http://localhost:3000/elia-exchange/exchanges/resident-card-issuance" 
        }
    }
} 
```

### [Resident] Initiate issuance exchange using the request URL

Initiate a request for a PermanentResidentCard by POSTing to the `url` directly in Postman or by navigating to the `Vc Api Controller initiate Exchange` request in the collection.
If using the collection request, fill in the `exchangeid` param to be `resident-card-issuance`.

Send the request. A similar json should be returned in the response body:
```json
{
    "errors": [],
    "vpRequest": {
        "challenge": "57ca126c-acbf-4da4-8f79-447150e93128",
        "query": [
            {
                "type": "DIDAuth",
                "credentialQuery": []
            }
        ],
        "interact": {
            "service": [
                {
                    "type": "MediatedHttpPresentationService2021",
                    "serviceEndpoint": "http://localhost:3000/exchanges/resident-card-issuance/55fb5bc5-4f5f-40c8-aa8d-f3a1991637fc"
                }
            ]
        }
    }
}
```
The `challenge` value and the final fragment of the `serviceEndpoint`, which is the `transaction id`, should be different.

The response contains a VP Request, which is a specification defined here: https://w3c-ccg.github.io/vp-request-spec/.
You can see that the VP Request's `query` section contains a `DIDAuth` query.
This means that we must authenticate as our chosen DID in order to obtain the credential that we requested.

Also note the `service` in the `interact` section of the VP Request.
This is providing the location at which we can continue the credential exchange once we have met the `query` requirements.
      
### [Resident] Create a DID authentication proof

Let's create a new DID for which the citizen can prove control.
This DID will be the Subject identifier of the Resident Card credential.

Navigate to the `DID Controller create` request under the `did` folder.
Ensure the request body is as shown and send.
```json
{
    "method": "key"
}
```
This should give a response similar to this one, with a different `did`.
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

Then, open the `Vc Api Controller prove Authentication Presentation` request under the `vc-api` folder.
In the request body, use the following json, filled with your own values.
The `challenge` should be value received from the VP Request in the previous step.

```json
{
    "did": "FILL YOUR DID HERE",
    "options": {
        "verificationMethod": "FILL YOUR VERIFICATION METHOD HERE",
        "proofPurpose": "authentication",
        "challenge": "FILL YOUR CHALLENGE HERE"
    }
}
```

```json
{
    "did": "did:key:z6MkvWkza1fMBWhKnYE3CgMgxHem62YkEw4JbdmEZeFTEZ7A",
    "options": {
        "verificationMethod": "did:key:z6MkvWkza1fMBWhKnYE3CgMgxHem62YkEw4JbdmEZeFTEZ7A#z6MkvWkza1fMBWhKnYE3CgMgxHem62YkEw4JbdmEZeFTEZ7A",
        "proofPurpose": "authentication",
        "challenge": "c2e806b4-35ed-409b-bc3a-b849d7c2b204"
    }
}
```

Send the request. The response should be a verifiable presentation, similar to the one below.
```json
{
    "@context": [
        "https://www.w3.org/2018/credentials/v1"
    ],
    "type": "VerifiablePresentation",
    "proof": {
        "type": "Ed25519Signature2018",
        "proofPurpose": "authentication",
        "challenge": "c2e806b4-35ed-409b-bc3a-b849d7c2b204",
        "verificationMethod": "did:key:z6MkvWkza1fMBWhKnYE3CgMgxHem62YkEw4JbdmEZeFTEZ7A#z6MkvWkza1fMBWhKnYE3CgMgxHem62YkEw4JbdmEZeFTEZ7A",
        "created": "2022-04-29T09:25:55.969Z",
        "jws": "eyJhbGciOiJFZERTQSIsImNyaXQiOlsiYjY0Il0sImI2NCI6ZmFsc2V9..51vek0DLAcdL2DxMRQlOFfFz306Y-EDvqhWYzCInU9UYFT_HQZHW2udSeX2w35Nn-JO4ouhJFeiM8l3e2sEEBQ"
    },
    "holder": "did:key:z6MkvWkza1fMBWhKnYE3CgMgxHem62YkEw4JbdmEZeFTEZ7A"
}
```

### Continue exchange by submitting the DID Auth proof

Continue the exchange using the DIDAuth presentation.
To do this, open the `Vc Api Controller continue Exchange` request in the `vc-api/exchanges/{exchange id}/{transaction id}` folder.
In the request params, use the `transactionId` from the `serviceEndpoint` in the VP Request and `exchangeId` as `resident-card-issuance`.
In the request body, copy the VP that was obtained from the previous step.
Send the request.
The response should be similar to as shown below.
This response indicates that the client attempt to continue the exchange again (after some interval), using the service endpoint.

```json
{
    "errors": [],
    "vpRequest": {
        "challenge": "08070970-638c-4b43-91bd-08325b08cc4a",
        "query": [],
        "interact": {
            "service": [
                {
                    "type": "MediatedHttpPresentationService2021",
                    "serviceEndpoint": "http://localhost:3000/vc-api/exchanges/resident-card-issuance/27ce6175-bab7-4a1b-84b2-87cf87ad9163"
                }
            ]
        }
    }
}
```

#### [Authority portal] Issue "resident card" credential and add a review

In a deployed environment, the authority portal would operate a service which could be notified of the submitted DID Auth presentation.
However, in our case, we can continue with the issuance flow with the authority portal having implicit knowledge of the submitted presentation. 

The authority portal can rely on VC-API's verification of the credential proofs and conformance to the credential query.
The authority portal can then proceed with reviewing the presentation and issuing the "resident card" credential.
First, the authority portal needs a DID from which they can issue a credential.

Again, navigate to the `DID Controller create` request under the `did` folder.
Ensure the request body is as shown and send.
```json
{
    "method": "key"
}
```

Again, this should give a response similar to this one, with a different `did`.
Note down the `id` property. This is the authority portals's DID.

```json
{
    "id": "did:key:z6MkjB8kjJee3JoJ9WmzTG2vXhWJ9KtwPtWLtEec17iFNiEL",
    "verificationMethod": [
        {
            "id": "did:key:z6MkjB8kjJee3JoJ9WmzTG2vXhWJ9KtwPtWLtEec17iFNiEL#z6MkjB8kjJee3JoJ9WmzTG2vXhWJ9KtwPtWLtEec17iFNiEL",
            "type": "Ed25519VerificationKey2018",
            "controller": "did:key:z6MkjB8kjJee3JoJ9WmzTG2vXhWJ9KtwPtWLtEec17iFNiEL",
            "publicKeyJwk": {
                "crv": "Ed25519",
                "x": "Rijl5w3coKZ2CThvbktmoyaUWxii1hwkfC2R2DrPlxE",
                "kty": "OKP",
                "kid": "vIkflusUjN5yuC5d5gr5GPCK3_reiT3SXhYMTMuuRFg"
            }
        }
    ]
}
```

After having created a new DID, the authority portal can then issue a credential to the resident DID that was previously created.
The authority portal may want to confirm that the resident in question controls the DID first, however this step is currently omitted.

Navigate to the `Vc Api Controller issue Credential` request under the `vc-api` folder.
Fill in, in the JSON below, the resident DID as the `subject` id, the authority portal DID as the `issuer` id and the `verificationMethod.id` from the DID document of the authority portal as the `options.verificationMethod` from the DIDs that were generated in previous steps.

```json
{
  "credential": {
      "@context":[
          "https://www.w3.org/2018/credentials/v1",
          "https://w3id.org/citizenship/v1"
      ],
      "id":"https://issuer.oidp.uscis.gov/credentials/83627465",
      "type":[
          "VerifiableCredential",
          "PermanentResidentCard"
      ],
      "issuer":"<FILL AUTHORITY DID>",
      "issuanceDate":"2019-12-03T12:19:52Z",
      "expirationDate":"2029-12-03T12:19:52Z",
      "credentialSubject":{
          "id":"<FILL RESIDENT DID>",
          "type":[
            "PermanentResident",
            "Person"
          ],
          "givenName":"JOHN",
          "familyName":"SMITH",
          "gender":"Male",
          "image":"data:image/png;base64,iVBORw0KGgo...kJggg==",
          "residentSince":"2015-01-01",
          "lprCategory":"C09",
          "lprNumber":"999-999-999",
          "commuterClassification":"C1",
          "birthCountry":"Bahamas",
          "birthDate":"1958-07-17"
      }
    },
    "options": {
        "verificationMethod": "<FILL AUTHORITY VERIFICATION METHOD>",
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
        "https://w3id.org/citizenship/v1"
    ],
    "id": "https://issuer.oidp.uscis.gov/credentials/83627465",
    "type": [
        "VerifiableCredential",
        "PermanentResidentCard"
    ],
    "credentialSubject": {
        "id": "did:key:z6MkvWkza1fMBWhKnYE3CgMgxHem62YkEw4JbdmEZeFTEZ7A",
        "gender": "Male",
        "commuterClassification": "C1",
        "birthDate": "1958-07-17",
        "image": "data:image/png;base64,iVBORw0KGgo...kJggg==",
        "residentSince": "2015-01-01",
        "givenName": "JOHN",
        "type": [
            "PermanentResident",
            "Person"
        ],
        "lprCategory": "C09",
        "birthCountry": "Bahamas",
        "lprNumber": "999-999-999",
        "familyName": "SMITH"
    },
    "issuer": "did:key:z6MkjB8kjJee3JoJ9WmzTG2vXhWJ9KtwPtWLtEec17iFNiEL",
    "issuanceDate": "2019-12-03T12:19:52Z",
    "proof": {
        "type": "Ed25519Signature2018",
        "proofPurpose": "assertionMethod",
        "verificationMethod": "did:key:z6MkjB8kjJee3JoJ9WmzTG2vXhWJ9KtwPtWLtEec17iFNiEL#z6MkjB8kjJee3JoJ9WmzTG2vXhWJ9KtwPtWLtEec17iFNiEL",
        "created": "2022-04-29T09:53:23.786Z",
        "jws": "eyJhbGciOiJFZERTQSIsImNyaXQiOlsiYjY0Il0sImI2NCI6ZmFsc2V9..slzsK4BoLyMHX18MtnVlwF9JqKj4BvVC46cjyVBPFPwrjpzGhbLLbAV3x_j-_B4ZUZuQBa5a-yq6CiW6sJ26AA"
    },
    "expirationDate": "2029-12-03T12:19:52Z"
}
```

The authority portal should then prove a presentation in order to present the credential to the resident.
Open the `Vc Api Controller prove Presentation` request under the `vc-api` folder.

Fill the body with json below, replacing the "FILL" values appropriately.

```json
{
    "presentation": {
        "@context": ["https://www.w3.org/2018/credentials/v1"],
        "type": ["VerifiablePresentation"],
        "verifiableCredential": ["<FILL WITH THE ISSUED CREDENTIAL>"]
    },
    "options": {
        "verificationMethod": "<FILL WITH VERIFICATION METHOD ID OF AUTHORITY PORTAL>"
    }
}
```

For example, the body with the filled values would look like:
```json
{
    "presentation": {
        "@context": [
            "https://www.w3.org/2018/credentials/v1"
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
                    "id": "did:key:z6MkvWkza1fMBWhKnYE3CgMgxHem62YkEw4JbdmEZeFTEZ7A",
                    "gender": "Male",
                    "commuterClassification": "C1",
                    "birthDate": "1958-07-17",
                    "image": "data:image/png;base64,iVBORw0KGgo...kJggg==",
                    "residentSince": "2015-01-01",
                    "givenName": "JOHN",
                    "type": [
                        "PermanentResident",
                        "Person"
                    ],
                    "lprCategory": "C09",
                    "birthCountry": "Bahamas",
                    "lprNumber": "999-999-999",
                    "familyName": "SMITH"
                },
                "issuer": "did:key:z6MkjB8kjJee3JoJ9WmzTG2vXhWJ9KtwPtWLtEec17iFNiEL",
                "issuanceDate": "2019-12-03T12:19:52Z",
                "proof": {
                    "type": "Ed25519Signature2018",
                    "proofPurpose": "assertionMethod",
                    "verificationMethod": "did:key:z6MkjB8kjJee3JoJ9WmzTG2vXhWJ9KtwPtWLtEec17iFNiEL#z6MkjB8kjJee3JoJ9WmzTG2vXhWJ9KtwPtWLtEec17iFNiEL",
                    "created": "2022-04-29T09:53:23.786Z",
                    "jws": "eyJhbGciOiJFZERTQSIsImNyaXQiOlsiYjY0Il0sImI2NCI6ZmFsc2V9..slzsK4BoLyMHX18MtnVlwF9JqKj4BvVC46cjyVBPFPwrjpzGhbLLbAV3x_j-_B4ZUZuQBa5a-yq6CiW6sJ26AA"
                },
                "expirationDate": "2029-12-03T12:19:52Z"
            }
        ]
    },
    "options": {
        "verificationMethod": "did:key:z6MkjB8kjJee3JoJ9WmzTG2vXhWJ9KtwPtWLtEec17iFNiEL#z6MkjB8kjJee3JoJ9WmzTG2vXhWJ9KtwPtWLtEec17iFNiEL"
    }
}
```

This should return a verifiable presentation similar to this one:
```json
{
    "@context": [
        "https://www.w3.org/2018/credentials/v1"
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
                "id": "did:key:z6MkvWkza1fMBWhKnYE3CgMgxHem62YkEw4JbdmEZeFTEZ7A",
                "commuterClassification": "C1",
                "birthDate": "1958-07-17",
                "lprCategory": "C09",
                "residentSince": "2015-01-01",
                "gender": "Male",
                "image": "data:image/png;base64,iVBORw0KGgo...kJggg==",
                "givenName": "JOHN",
                "type": [
                    "PermanentResident",
                    "Person"
                ],
                "birthCountry": "Bahamas",
                "lprNumber": "999-999-999",
                "familyName": "SMITH"
            },
            "issuer": "did:key:z6MkjB8kjJee3JoJ9WmzTG2vXhWJ9KtwPtWLtEec17iFNiEL",
            "issuanceDate": "2019-12-03T12:19:52Z",
            "proof": {
                "type": "Ed25519Signature2018",
                "proofPurpose": "assertionMethod",
                "verificationMethod": "did:key:z6MkjB8kjJee3JoJ9WmzTG2vXhWJ9KtwPtWLtEec17iFNiEL#z6MkjB8kjJee3JoJ9WmzTG2vXhWJ9KtwPtWLtEec17iFNiEL",
                "created": "2022-04-29T09:53:23.786Z",
                "jws": "eyJhbGciOiJFZERTQSIsImNyaXQiOlsiYjY0Il0sImI2NCI6ZmFsc2V9..slzsK4BoLyMHX18MtnVlwF9JqKj4BvVC46cjyVBPFPwrjpzGhbLLbAV3x_j-_B4ZUZuQBa5a-yq6CiW6sJ26AA"
            },
            "expirationDate": "2029-12-03T12:19:52Z"
        }
    ],
    "proof": {
        "type": "Ed25519Signature2018",
        "verificationMethod": "did:key:z6MkjB8kjJee3JoJ9WmzTG2vXhWJ9KtwPtWLtEec17iFNiEL#z6MkjB8kjJee3JoJ9WmzTG2vXhWJ9KtwPtWLtEec17iFNiEL",
        "created": "2022-04-29T10:21:42.824Z",
        "jws": "eyJhbGciOiJFZERTQSIsImNyaXQiOlsiYjY0Il0sImI2NCI6ZmFsc2V9..FW8cPUUglFWbq61ve02LD-JmVQNr-TQ03rc3wlFeOccbapR0y5IsoNEMHF3wU54kdG9mAeLzJ5aXH6uUFA0iAA"
    }
}
```

With a verifiable presentation in hand, the authority portal can add a review to the in-progress exchange.
Open the `Vc Api Controller add Submission Review` request under the `vc-api/exchanges/{exchange id}/{transaction id}` folder.

Use the same `exchangeId` and `transactionId` as the path variables as in the "Continue Exchange" step.

Fill the json below appropriately and send as the body:
```json
{
    "result": "approved",
    "vp": "<COPY VP FROM PREVIOUS STEP HERE>"
}
```

```json
{
    "result": "approved",
    "vp": {
        "@context": [
            "https://www.w3.org/2018/credentials/v1"
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
                    "id": "did:key:z6MkvWkza1fMBWhKnYE3CgMgxHem62YkEw4JbdmEZeFTEZ7A",
                    "commuterClassification": "C1",
                    "birthDate": "1958-07-17",
                    "lprCategory": "C09",
                    "residentSince": "2015-01-01",
                    "gender": "Male",
                    "image": "data:image/png;base64,iVBORw0KGgo...kJggg==",
                    "givenName": "JOHN",
                    "type": [
                        "PermanentResident",
                        "Person"
                    ],
                    "birthCountry": "Bahamas",
                    "lprNumber": "999-999-999",
                    "familyName": "SMITH"
                },
                "issuer": "did:key:z6MkjB8kjJee3JoJ9WmzTG2vXhWJ9KtwPtWLtEec17iFNiEL",
                "issuanceDate": "2019-12-03T12:19:52Z",
                "proof": {
                    "type": "Ed25519Signature2018",
                    "proofPurpose": "assertionMethod",
                    "verificationMethod": "did:key:z6MkjB8kjJee3JoJ9WmzTG2vXhWJ9KtwPtWLtEec17iFNiEL#z6MkjB8kjJee3JoJ9WmzTG2vXhWJ9KtwPtWLtEec17iFNiEL",
                    "created": "2022-04-29T09:53:23.786Z",
                    "jws": "eyJhbGciOiJFZERTQSIsImNyaXQiOlsiYjY0Il0sImI2NCI6ZmFsc2V9..slzsK4BoLyMHX18MtnVlwF9JqKj4BvVC46cjyVBPFPwrjpzGhbLLbAV3x_j-_B4ZUZuQBa5a-yq6CiW6sJ26AA"
                },
                "expirationDate": "2029-12-03T12:19:52Z"
            }
        ],
        "proof": {
            "type": "Ed25519Signature2018",
            "verificationMethod": "did:key:z6MkjB8kjJee3JoJ9WmzTG2vXhWJ9KtwPtWLtEec17iFNiEL#z6MkjB8kjJee3JoJ9WmzTG2vXhWJ9KtwPtWLtEec17iFNiEL",
            "created": "2022-04-29T10:21:42.824Z",
            "jws": "eyJhbGciOiJFZERTQSIsImNyaXQiOlsiYjY0Il0sImI2NCI6ZmFsc2V9..FW8cPUUglFWbq61ve02LD-JmVQNr-TQ03rc3wlFeOccbapR0y5IsoNEMHF3wU54kdG9mAeLzJ5aXH6uUFA0iAA"
        }
    }
}
```

The result should be a `201` status code with an empty `errors` array.

#### [Resident] Continue the exchange and obtain the credentials

As the review is submitted, the resident can continue the exchange to receive the credential.

To do this, return to the `Vc Api Controller continue Exchange` request in the `vc-api/exchanges/{exchange id}/{transaction id}` folder.
Resend the request.
The response should be similar to the following, where the `vp` contains the issued credential.

```json
{
    "errors": [],
    "vp": {
        "@context": [
            "https://www.w3.org/2018/credentials/v1"
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
                    "id": "did:key:z6MkvWkza1fMBWhKnYE3CgMgxHem62YkEw4JbdmEZeFTEZ7A",
                    "commuterClassification": "C1",
                    "birthDate": "1958-07-17",
                    "lprCategory": "C09",
                    "residentSince": "2015-01-01",
                    "gender": "Male",
                    "image": "data:image/png;base64,iVBORw0KGgo...kJggg==",
                    "givenName": "JOHN",
                    "type": [
                        "PermanentResident",
                        "Person"
                    ],
                    "birthCountry": "Bahamas",
                    "lprNumber": "999-999-999",
                    "familyName": "SMITH"
                },
                "issuer": "did:key:z6MkjB8kjJee3JoJ9WmzTG2vXhWJ9KtwPtWLtEec17iFNiEL",
                "issuanceDate": "2019-12-03T12:19:52Z",
                "proof": {
                    "type": "Ed25519Signature2018",
                    "proofPurpose": "assertionMethod",
                    "verificationMethod": "did:key:z6MkjB8kjJee3JoJ9WmzTG2vXhWJ9KtwPtWLtEec17iFNiEL#z6MkjB8kjJee3JoJ9WmzTG2vXhWJ9KtwPtWLtEec17iFNiEL",
                    "created": "2022-04-29T09:53:23.786Z",
                    "jws": "eyJhbGciOiJFZERTQSIsImNyaXQiOlsiYjY0Il0sImI2NCI6ZmFsc2V9..slzsK4BoLyMHX18MtnVlwF9JqKj4BvVC46cjyVBPFPwrjpzGhbLLbAV3x_j-_B4ZUZuQBa5a-yq6CiW6sJ26AA"
                },
                "expirationDate": "2029-12-03T12:19:52Z"
            }
        ],
        "proof": {
            "type": "Ed25519Signature2018",
            "verificationMethod": "did:key:z6MkjB8kjJee3JoJ9WmzTG2vXhWJ9KtwPtWLtEec17iFNiEL#z6MkjB8kjJee3JoJ9WmzTG2vXhWJ9KtwPtWLtEec17iFNiEL",
            "created": "2022-04-29T10:21:42.824Z",
            "jws": "eyJhbGciOiJFZERTQSIsImNyaXQiOlsiYjY0Il0sImI2NCI6ZmFsc2V9..FW8cPUUglFWbq61ve02LD-JmVQNr-TQ03rc3wlFeOccbapR0y5IsoNEMHF3wU54kdG9mAeLzJ5aXH6uUFA0iAA"
        }
    }
}
```

### Permanent Resident Card verification

#### [Verifier] Configure Credential Exchange

The Verifier needs to configure the parameters of the credential exchange.
To do this, navigate to the `Vc Api Controller create Exchange` under `vc-api/exchanges` and send with the json below.
In the json below, `exchangeId` is an id unique to this exchange, for example a UUID.

Note the constraint on the `$.type` path of the credential.
This is used to require that the presented credential be of type "PermanentResidentCard".
For more information on credential constraints, see the [Presentation Exchange specification](https://identity.foundation/presentation-exchange).

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
                          "id":"permanent_resident_card",
                          "name":"Permanent Resident Card",
                          "purpose":"We can only allow permanent residents into the application",
                          "constraints": {
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
   "callback":[]
}
```

The response should have a `201` code and have an empty errors array.

#### [Verifier] Provide an exchange invitation to the resident

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

#### [Resident] Present required credentials

Initiate the credential exchange by POSTing to the `url` directly in Postman or by navigating to the `Vc Api Controller initiate Exchange` request in the collection.
If using the collection request, fill in the `exchangeId` param to be the value used for the exchange Id by the Verifier.

Send the request. A similar json should be returned in the response body:
```json
{
    "errors": [],
    "vpRequest": {
        "challenge": "7c66d573-4da6-4e13-b52f-9b5c844d6d52",
        "query": [
            {
                "type": "PresentationDefinition",
                "credentialQuery": [
                    {
                        "presentationDefinition": {
                            "id": "286bc1e0-f1bd-488a-a873-8d71be3c690e",
                            "input_descriptors": [
                                {
                                    "id": "permanent_resident_card",
                                    "name": "Permanent Resident Card",
                                    "purpose": "We can only allow permanent residents into the application"
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
                    "serviceEndpoint": "http://localhost:3000/vc-api/exchanges/presentation-1/e8b0b9a0-6265-45df-b811-1d4e4e4790b1"
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
      
### [Resident] Create the required presentation

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
            "<FILL WITH VC RECEIVED FROM AUTHORITY>"
        ],
        "holder": "<FILL WITH RESIDENT DID>"
    },
    "options": {
        "verificationMethod": "<FILL WITH RESIDENT DID VERIFICATION METHOD",
        "proofPurpose": "authentication",
        "challenge": "<FILL WITH CHALLENGE FROM VP REQUEST>"
    }
}
```

For example, your filled json would look like:

```json
{
    "presentation": {
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
                    "id": "did:key:z6MkvWkza1fMBWhKnYE3CgMgxHem62YkEw4JbdmEZeFTEZ7A",
                    "gender": "Male",
                    "commuterClassification": "C1",
                    "birthDate": "1958-07-17",
                    "image": "data:image/png;base64,iVBORw0KGgo...kJggg==",
                    "residentSince": "2015-01-01",
                    "givenName": "JOHN",
                    "type": [
                        "PermanentResident",
                        "Person"
                    ],
                    "lprCategory": "C09",
                    "birthCountry": "Bahamas",
                    "lprNumber": "999-999-999",
                    "familyName": "SMITH"
                },
                "issuer": "did:key:z6MkjB8kjJee3JoJ9WmzTG2vXhWJ9KtwPtWLtEec17iFNiEL",
                "issuanceDate": "2019-12-03T12:19:52Z",
                "proof": {
                    "type": "Ed25519Signature2018",
                    "proofPurpose": "assertionMethod",
                    "verificationMethod": "did:key:z6MkjB8kjJee3JoJ9WmzTG2vXhWJ9KtwPtWLtEec17iFNiEL#z6MkjB8kjJee3JoJ9WmzTG2vXhWJ9KtwPtWLtEec17iFNiEL",
                    "created": "2022-04-29T09:53:23.786Z",
                    "jws": "eyJhbGciOiJFZERTQSIsImNyaXQiOlsiYjY0Il0sImI2NCI6ZmFsc2V9..slzsK4BoLyMHX18MtnVlwF9JqKj4BvVC46cjyVBPFPwrjpzGhbLLbAV3x_j-_B4ZUZuQBa5a-yq6CiW6sJ26AA"
                },
                "expirationDate": "2029-12-03T12:19:52Z"
            }
        ],
        "holder": "did:key:z6MkvWkza1fMBWhKnYE3CgMgxHem62YkEw4JbdmEZeFTEZ7A"
    },
    "options": {
        "verificationMethod": "did:key:z6MkvWkza1fMBWhKnYE3CgMgxHem62YkEw4JbdmEZeFTEZ7A#z6MkvWkza1fMBWhKnYE3CgMgxHem62YkEw4JbdmEZeFTEZ7A",
        "proofPurpose": "authentication",
        "challenge": "7c66d573-4da6-4e13-b52f-9b5c844d6d52"
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
                "https://w3id.org/citizenship/v1"
            ],
            "id": "https://issuer.oidp.uscis.gov/credentials/83627465",
            "type": [
                "VerifiableCredential",
                "PermanentResidentCard"
            ],
            "credentialSubject": {
                "id": "did:key:z6MkvWkza1fMBWhKnYE3CgMgxHem62YkEw4JbdmEZeFTEZ7A",
                "birthDate": "1958-07-17",
                "image": "data:image/png;base64,iVBORw0KGgo...kJggg==",
                "lprCategory": "C09",
                "commuterClassification": "C1",
                "birthCountry": "Bahamas",
                "lprNumber": "999-999-999",
                "residentSince": "2015-01-01",
                "type": [
                    "PermanentResident",
                    "Person"
                ],
                "gender": "Male",
                "familyName": "SMITH",
                "givenName": "JOHN"
            },
            "issuer": "did:key:z6MkjB8kjJee3JoJ9WmzTG2vXhWJ9KtwPtWLtEec17iFNiEL",
            "issuanceDate": "2019-12-03T12:19:52Z",
            "proof": {
                "type": "Ed25519Signature2018",
                "proofPurpose": "assertionMethod",
                "verificationMethod": "did:key:z6MkjB8kjJee3JoJ9WmzTG2vXhWJ9KtwPtWLtEec17iFNiEL#z6MkjB8kjJee3JoJ9WmzTG2vXhWJ9KtwPtWLtEec17iFNiEL",
                "created": "2022-04-29T09:53:23.786Z",
                "jws": "eyJhbGciOiJFZERTQSIsImNyaXQiOlsiYjY0Il0sImI2NCI6ZmFsc2V9..slzsK4BoLyMHX18MtnVlwF9JqKj4BvVC46cjyVBPFPwrjpzGhbLLbAV3x_j-_B4ZUZuQBa5a-yq6CiW6sJ26AA"
            },
            "expirationDate": "2029-12-03T12:19:52Z"
        }
    ],
    "proof": {
        "type": "Ed25519Signature2018",
        "proofPurpose": "authentication",
        "challenge": "7c66d573-4da6-4e13-b52f-9b5c844d6d52",
        "verificationMethod": "did:key:z6MkvWkza1fMBWhKnYE3CgMgxHem62YkEw4JbdmEZeFTEZ7A#z6MkvWkza1fMBWhKnYE3CgMgxHem62YkEw4JbdmEZeFTEZ7A",
        "created": "2022-04-29T10:56:09.336Z",
        "jws": "eyJhbGciOiJFZERTQSIsImNyaXQiOlsiYjY0Il0sImI2NCI6ZmFsc2V9..Sqpo8ostkoK7_69TxvHMzzRLuebdZ8IaXj2z6p1-M30FSZdIXMPXBg4kyukoKZ4Jls7eXyJ0FgaSKirGO-reCA"
    },
    "holder": "did:key:z6MkvWkza1fMBWhKnYE3CgMgxHem62YkEw4JbdmEZeFTEZ7A"
}
```

### [Resident] Continue the exchange

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