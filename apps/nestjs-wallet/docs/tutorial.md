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
- [Authority portal action] Create a DID for the autority portal in the form of a key DID method
- [Authority portal action] Register the DID as default DID for the authority portal
- [Authority portal action] Create a credential offer that can be transmitted to the citizen as a QR code or a deep link
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

### Setup up the app environment variables

Copy the values from the tutorial `env` file to the `env` file that will be picked up by the app.
```json
cp .env.tutorial .env
```

### [Authority portal] Setup the credential issuer

The credential needs to be issued by an entity. In this step, we will create the identifier for this entity and the private key required to sign the credential proof.

In Postman, navigate to the `DID Controller create` request under the `did` folder.

In the Body tab of the Postman request dialog, enter the following json:
```json
{
    "method": "key"
}
```
This asks the wallet to generate a DID with the [key](https://w3c-ccg.github.io/did-method-key/) DID method.

Send the request. The response should have HTTP status code `201 Created` and have a body that is a DID Document.
The body should be similar to the following:
```json
{
    "id": "did:key:z6MknYDcJqDMBtyB1YThCvm3Y42xspMptCbhxoqc3meegdDJ",
    "verificationMethod": [
        {
            "id": "did:key:z6MknYDcJqDMBtyB1YThCvm3Y42xspMptCbhxoqc3meegdDJ#z6MknYDcJqDMBtyB1YThCvm3Y42xspMptCbhxoqc3meegdDJ",
            "type": "Ed25519VerificationKey2018",
            "controller": "did:key:z6MknYDcJqDMBtyB1YThCvm3Y42xspMptCbhxoqc3meegdDJ",
            "publicKeyJwk": {
                "kty": "OKP",
                "crv": "Ed25519",
                "x": "eCKlKS0Y207MvheQhALmKXc2iG9nLbtj30ZBMFdKlmE",
                "kid": "1vU9vQPMpBbxyHz8HA7pRkEPB57hTSAuXaKmTk02xIo"
            }
        }
    ]
}
```

We now need to configure the `elia-issuer` module to issue credentials using our newly created DID.

In Postman, navigate to the `Elia Issuer Controller set Issue Did` request under the `elia-issuer` folder.

Edit the json below with the DID `id` and verfification method `id` obtained from the DID document return in the request prior to this. Enter the filled json in the Body tab of the Postman request dialog.
```json
{
    "DID": "FILL YOUR DID HERE",
    "verificationMethodURI": "FILL YOUR VERIFICATION METHOD HERE"
}
```

Using sample DID document from, above the input would be as shown:
```json
{
    "DID": "did:key:z6MknYDcJqDMBtyB1YThCvm3Y42xspMptCbhxoqc3meegdDJ",
    "verificationMethodURI": "did:key:z6MknYDcJqDMBtyB1YThCvm3Y42xspMptCbhxoqc3meegdDJ#z6MknYDcJqDMBtyB1YThCvm3Y42xspMptCbhxoqc3meegdDJ"
}
```
You cannot use this sample input because your wallet instance does not control the private key associated with the DID/verification method.

Once you have filled in the request body, send the request. The response should have HTTP response code `200 OK`.

The wallet is now configured to issue credentials as the newly created DID.

### [Authority portal] Generate a credential offer

We will now obtain a credential offer from the `elia-issuer` module.

In Postman, navigate to the `Elia Issuer Controller get Credential Offer` `GET` request under the `elia-issuer` folder.
This request doesn't need any configuration and can be sent as is.
It should return the following json in the response body:
```json
{
    "typeAvailable": "PermanentResidentCard",
    "vcRequestUrl": "http://localhost:3000/elia-issuer/start-workflow/permanent-resident-card"
}
```
This response indicates that a Verifiable Credential of type "PermanentResidentCard" is available from this API and that a request for the credential can be initiated at the `vcRequestUrl`.

### Request a credential using the request URL

Initiate a request for a PermanentResidentCard by using the `vcRequestUrl` directly in Postman or by navigating to the `Elia Issuer Controller start Workflow` request in the collection.
If using the collection request, fill in the `workflowtype` param to be `permanent-resident-card`.

Send the request. A similar json should be returned in the response body:
```json
{
    "errors": [],
    "vpRequest": {
        "challenge": "57ca126c-acbf-4da4-8f79-447150e93128",
        "query": [
            {
                "type": "DIDAuth"
            }
        ],
        "interact": {
            "service": [
                {
                    "type": "VcApiPresentationService2021",
                    "serviceEndpoint": "http://localhost:3000/elia-issuer/active-flows/c4e0e642-02a2-4a1a-91c6-40069b328238"
                }
            ]
        }
    }
}
```
The `challenge` value and the final fragment of the `serviceEndpoint`, which is the `flow id`, should be different.

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

### Continue workflow and obtain the verifiable credential

To obtain the VC, continue the workflow using the DIDAuth presentation.
To do this, open the `Elia Issuer Controller continue Workflow` request in the `elia-issuer` folder.
In the request params, use the `flowid` from the `serviceEndpoint` in the VP Request.
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
            "id": "did:example:b34ca6cd37bbf23",
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