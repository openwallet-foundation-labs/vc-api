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

# Verificable Credentials Contexts

## Contexts in the VC Specification

See the [Contexts section](https://www.w3.org/TR/vc-data-model/#contexts) of the specification for more general information about context in VCs.

## Loading Contexts in Credentials

Though contexts are indentified by URLs, for security and privacy it is best to load contexts from local copies.
DIDKit, the SSI library which this implementation of VC-API uses, only supports contexts which are built into library.
For more information on this, see the [DIDKit documentation on document loading](https://spruceid.dev/docs/didkit/document-loading/).

Given the need to re-build DIDKit in order to add a new context, it is not possible with this current implementation of VC-API
to issue or verify a credential which refers a context which is not in the DIDKit [default contexts](https://github.com/spruceid/ssi/tree/main/contexts).
However, it is possible to use a new context by including the context inline into the credential.

### In-line contexts

Rather than referencing a context via a URI in a JSON-LD `@context` array, it is possible to include the context directly in-line.

For example, a verifiable credential may contain a `@context` array as follows:
```json
{
   "@context": [
      "https://www.w3.org/2018/credentials/v1",
      {
         "custom": "https://example.com/custom-context-2022#",
         "customObject": {
            "@id": "custom:customObject",
            "@type": "custom:ExampleObject"
         },
         "customField": "custom:customField"
      }
   ],
   "id": "urn:uuid:7f94d397-3e70-4a43-945e-1a13069e636f",
   "type": [
      "VerifiableCredential"
   ],
   "credentialSubject":{
      "id": "did:example:123",
      "customObject": {
        "customField": "customValue"
      }
   },
   "issuer": "did:example:456",
   "issuanceDate": "2022-03-18T08:57:32.477Z"
}
```
