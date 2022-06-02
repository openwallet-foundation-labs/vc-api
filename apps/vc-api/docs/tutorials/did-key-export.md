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

# DID Generation and Key Export Tutorial

## Overview and Objective

### Technical workflows

Steps covered in this tutorial:
1. DID Generation
1. Key Export
1. Key Import

## Steps

### 1 Create a DID

Let's create a new DID.

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
  "id": "did:key:z6MkuzZiNGDxg7vfrwpwC5LCfznA2NaJr5SNvwmN6dKv6Pom",
  "verificationMethod": [
    {
      "id": "did:key:z6MkuzZiNGDxg7vfrwpwC5LCfznA2NaJr5SNvwmN6dKv6Pom#z6MkuzZiNGDxg7vfrwpwC5LCfznA2NaJr5SNvwmN6dKv6Pom",
      "type": "Ed25519VerificationKey2018",
      "controller": "did:key:z6MkuzZiNGDxg7vfrwpwC5LCfznA2NaJr5SNvwmN6dKv6Pom",
      "publicKeyJwk": {
        "crv": "Ed25519",
        "x": "5uRJcJ67oMzfaB3XXQeLNj_Bv3ew1mmV8lItQ1k52og",
        "kty": "OKP",
        "kid": "KizsQVRSz6l73kFnrAHJ1V6c5YQS6I0SS9zyZMNNdRs"
      }
    }
  ]
}
```

**Expected Response HTTP Status Code**

`201 Created`

### 2 Export Key

The key can be exported by using the key id located at `verificationMethod.publicKeyJwk.kid` in the DID document from the previous step.

Send the request as described below.

**Request URL**

`{VC API base url}/key/{keyId}`

**HTTP Verb**

`GET`

**Request Body**

*empty*

**Sample Expected Response Body**

```json
{
  "publicKeyThumbprint": "KizsQVRSz6l73kFnrAHJ1V6c5YQS6I0SS9zyZMNNdRs",
  "privateKey": {
    "crv": "Ed25519",
    "d": "31DlEXUMXAvcAuTpBl5cPlPavrzo4I9s63WiT0ni8zg",
    "x": "5uRJcJ67oMzfaB3XXQeLNj_Bv3ew1mmV8lItQ1k52og",
    "kty": "OKP"
  },
  "publicKey": {
    "crv": "Ed25519",
    "x": "5uRJcJ67oMzfaB3XXQeLNj_Bv3ew1mmV8lItQ1k52og",
    "kty": "OKP",
    "kid": "KizsQVRSz6l73kFnrAHJ1V6c5YQS6I0SS9zyZMNNdRs"
  }
}
```

### 3 Import Key

The key can be imported by providing the `privateKey` and `publicKey`.

Send the request as described below.

**Request URL**

`{VC API base url}/key`

**HTTP Verb**

`POST`

**Request Body**

```json
{
  "privateKey": {
    "crv": "Ed25519",
    "d": "31DlEXUMXAvcAuTpBl5cPlPavrzo4I9s63WiT0ni8zg",
    "x": "5uRJcJ67oMzfaB3XXQeLNj_Bv3ew1mmV8lItQ1k52og",
    "kty": "OKP"
  },
  "publicKey": {
    "crv": "Ed25519",
    "x": "5uRJcJ67oMzfaB3XXQeLNj_Bv3ew1mmV8lItQ1k52og",
    "kty": "OKP",
    "kid": "KizsQVRSz6l73kFnrAHJ1V6c5YQS6I0SS9zyZMNNdRs"
  }
}
```

**Sample Expected Response Body**

```json
{
  "keyId": "KizsQVRSz6l73kFnrAHJ1V6c5YQS6I0SS9zyZMNNdRs"
}
```


