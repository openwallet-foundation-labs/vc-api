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
In the example below, we will issue a permanent residency card to a user we will call "citizen". We use the context "https://w3id.org/citizenship/v1" which describes the data of a VC of type "PermanentResidentCard".

Here is an extract of the context:

        ...
        "id": "@id",
        "type": "@type",

        "ctzn": "https://w3id.org/citizenship#",
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

We therefore assume that the citizen is connected to the autority portal and that the information contained in the context about the citizen is available in the autority portal database.

Business workflow:
- The citizen requests a "PermanentResidentCard" proof on the autority portal
- The autority portal displays a QR code for the citizen to scan with his mobile wallet.
- The citizen's mobile wallet contacts the autority portal to prove that he has a DID
- The citizen's mobile wallet contacts the autority portal again to receive the "PermanentResidentCard"
- The autority portal responds by sending the "PermanentResidentCard" proof containing the citizen's information signed by the autority portal.

## Technical overview
From a technical point of view, in this tutorial, we have access to the server API but no mobile wallet is available. So we will use the server API for both roles of the portal and the mobile wallet.

We will follow the following steps in this tutorial:
- [Authority portal action] Configure credential issuance workflow
- [Authority portal action] Transmit an exchange invitation to the citizen as a QR code or a deep link
- [Citizen action] Request a credential using the request URL and obtain a [VP Request](https://w3c-ccg.github.io/vp-request-spec/) in return
- [Citizen action] Create a DID for the citizen in the form of a key DID method
- [Citizen action] Create an authentication proof (as a verfiable presentation) for the new DID
- [Citizen action] Send the authentication proof to the authority portal and receive the Permenant Resident verifiable credential in return

## Overview and Objective

The objective of this tutorial is walk through a simple credential issuance flow. A diagram of this flow is available in the root README.

## Steps

### Setup the Postman Collection

First, download and install [Postman](https://www.postman.com/downloads/).

Then, from the Postman app, import [the open-api json](./open-api.json) and [the environment](./ewf-ssi-wallet.postman_environment.json) for the Nest.js wallet. Instructions on how to import into Postman can be found [here](https://learning.postman.com/docs/getting-started/importing-and-exporting-data/#importing-data-into-postman).

### [Authority portal] Configure the credential issuance exchange

The authority portal needs to configure the parameters of the parameters of the permanent resident card issuance exchange.
To do this, navigate to the `Vc Api Controller configure Exchange` under `vc-api/exchanges` and send with the json below.

For information about the interact service type see https://w3c-ccg.github.io/vp-request-spec/#unmediated-presentation.

```json
{
    "exchangeId": "permanent-resident-card-issuance",
    "query": [
      {
        "type": "DIDAuth",
        "credentialQuery": []
      }
    ],
    "interactServices": [
      {
        "type": "UnmediatedHttpPresentationService2021",
        "baseUrl": "http://localhost:3000"
      }
    ]
}
```

### [Authority portal] Provide an exchange invitation to the citizen

The authority portal can communicate to the citizen that they can initiate request for a "PermanentResidentCard" credential by
providing them the json object below. They can do this through a QR code for example.

```json
{
    "typeAvailable": "PermanentResidentCard",
    "vcRequestUrl": "http://localhost:3000/elia-exchange/exchanges/permanent-resident-card-issuance"
}
```

### [Citizen] Request a credential using the request URL

Initiate a request for a PermanentResidentCard by POSTing to the `vcRequestUrl` directly in Postman or by navigating to the `Elia Exchange Controller initiate Exchange` request in the collection.
If using the collection request, fill in the `exchangeid` param to be `permanent-resident-card-issuance`.

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
                    "type": "UnmediatedHttpPresentationService2021",
                    "serviceEndpoint": "http://localhost:3000/exchanges/permanent-resident-card-issuance/55fb5bc5-4f5f-40c8-aa8d-f3a1991637fc"
                }
            ]
        }
    },
    "ack": {
        "status": "PENDING"
    }
}
```
The `challenge` value and the final fragment of the `serviceEndpoint`, which is the `transaction id`, should be different.

The response contains a VP Request, which is a specification defined here: https://w3c-ccg.github.io/vp-request-spec/.
You can see that the VP Request's `query` section contains a `DIDAuth` query.
This means that we must authenticate as our chosen DID in order to obtain the credential that we requested.

Also note the `service` in the `interact` section of the VP Request.
This is providing the location at which we can continue the credential request flow once we have met the `query` requirements.
      
### Create a DID authentication proof

Let's create a new DID as which we can authenticate.
This DID will be the Subject identifier of our credential.

Again, navigate to the `DID Controller create` request under the `did` folder.
Ensure the request body is as shown and send.
```json
{
    "method": "key"
}
```
This should give a response similar to this one, with a different `did`.
```json
{
    "id": "did:key:z6Mkj1L6dqc7tU7TNA4a5qftmfKEo58bDmEzfYmz5cw7JGDV",
    "verificationMethod": [
        {
            "id": "did:key:z6Mkj1L6dqc7tU7TNA4a5qftmfKEo58bDmEzfYmz5cw7JGDV#z6Mkj1L6dqc7tU7TNA4a5qftmfKEo58bDmEzfYmz5cw7JGDV",
            "type": "Ed25519VerificationKey2018",
            "controller": "did:key:z6Mkj1L6dqc7tU7TNA4a5qftmfKEo58bDmEzfYmz5cw7JGDV",
            "publicKeyJwk": {
                "kty": "OKP",
                "crv": "Ed25519",
                "x": "Q6Xqb6f7yFEtI-j5t4f5z33CHh9HtDznAGtCXMdi9Hg",
                "kid": "5zIVKRANIzk404_97zmiX6pjk6R3NkFJtouH9-XEYs8"
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
    "did": "did:key:z6Mkj1L6dqc7tU7TNA4a5qftmfKEo58bDmEzfYmz5cw7JGDV",
    "options": {
        "verificationMethod": "did:key:z6Mkj1L6dqc7tU7TNA4a5qftmfKEo58bDmEzfYmz5cw7JGDV#z6Mkj1L6dqc7tU7TNA4a5qftmfKEo58bDmEzfYmz5cw7JGDV",
        "proofPurpose": "authentication",
        "challenge": "57ca126c-acbf-4da4-8f79-447150e93128"
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
        "challenge": "57ca126c-acbf-4da4-8f79-447150e93128",
        "verificationMethod": "did:key:z6Mkj1L6dqc7tU7TNA4a5qftmfKEo58bDmEzfYmz5cw7JGDV#z6Mkj1L6dqc7tU7TNA4a5qftmfKEo58bDmEzfYmz5cw7JGDV",
        "created": "2022-01-11T06:56:23.156Z",
        "jws": "eyJhbGciOiJFZERTQSIsImNyaXQiOlsiYjY0Il0sImI2NCI6ZmFsc2V9.._8E6x42yrx8B5qveo0nAp6MNXnZ5rn0dYAH6regtDyk9Fhk9pgSKmVgVPt1NiTPFGrOxhUx_p-MM6GtCPRZcCQ"
    },
    "holder": "did:key:z6Mkj1L6dqc7tU7TNA4a5qftmfKEo58bDmEzfYmz5cw7JGDV"
}
```

### Continue exchange and obtain the verifiable credential

To obtain the VC, continue the workflow using the DIDAuth presentation.
To do this, open the `Elia Exchange Controller continue Exchange` request in the `elia-exchange` folder.
In the request params, use the `transactionId` from the `serviceEndpoint` in the VP Request and `exchangeId` as `permanent-resident-card-issuance`.
In the request body, copy the VP that was obtained from the previous step.

```json
{
    "@context": [
        "https://www.w3.org/2018/credentials/v1"
    ],
    "type": "VerifiablePresentation",
    "proof": {
        "type": "Ed25519Signature2018",
        "proofPurpose": "authentication",
        "challenge": "57ca126c-acbf-4da4-8f79-447150e93128",
        "verificationMethod": "did:key:z6Mkj1L6dqc7tU7TNA4a5qftmfKEo58bDmEzfYmz5cw7JGDV#z6Mkj1L6dqc7tU7TNA4a5qftmfKEo58bDmEzfYmz5cw7JGDV",
        "created": "2022-01-11T06:56:23.156Z",
        "jws": "eyJhbGciOiJFZERTQSIsImNyaXQiOlsiYjY0Il0sImI2NCI6ZmFsc2V9.._8E6x42yrx8B5qveo0nAp6MNXnZ5rn0dYAH6regtDyk9Fhk9pgSKmVgVPt1NiTPFGrOxhUx_p-MM6GtCPRZcCQ"
    },
    "holder": "did:key:z6Mkj1L6dqc7tU7TNA4a5qftmfKEo58bDmEzfYmz5cw7JGDV"
}
```

Send the request. The response should be similar to as shown below and contain the issued VC.
```json
{
    "errors": [],
    "vc": {
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
            "id": "did:key:z6Mkj1L6dqc7tU7TNA4a5qftmfKEo58bDmEzfYmz5cw7JGDV",
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
        "issuer": "did:key:z6MkezbR3UCtKJ8CoJwsSLQQhEPFTBZhatHzBGpjztLZnw3J",
        "issuanceDate": "2019-12-03T12:19:52Z",
        "proof": {
            "type": "Ed25519Signature2018",
            "verificationMethod": "did:key:z6MkezbR3UCtKJ8CoJwsSLQQhEPFTBZhatHzBGpjztLZnw3J#z6MkezbR3UCtKJ8CoJwsSLQQhEPFTBZhatHzBGpjztLZnw3J",
            "created": "2022-01-11T09:19:06.462Z",
            "jws": "eyJhbGciOiJFZERTQSIsImNyaXQiOlsiYjY0Il0sImI2NCI6ZmFsc2V9..-WrxrP7GxAEFPULn8cz8wG2hHwozLcLvOOdBuwsJXXbDI1Epv8hlqwpOYMvDGsd7ZmC0Qs6Pv9LYMS3wrk20BQ"
        },
        "expirationDate": "2029-12-03T12:19:52Z"
    }
}
```