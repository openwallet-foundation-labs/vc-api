# NestJs VC-API

## Description

This [vc-api app](./) is a NestJs implementation of the [W3C Credentials Community Group](https://w3c-ccg.github.io/) [VC API Specification](https://w3c-ccg.github.io/vc-api).
[Nest](https://github.com/nestjs/nest) is a Typescript framework for server-side applications.

## Tutorials

See [tutorials](./docs/tutorials/).

## Credential Exchanges

Credential exchanges are the processes by which credentials are moved between wallet/agent and issuer/verifer.
For more information on these processes, see the [exchanges documentation](./docs/exchanges.md). 

## Credential JSON-LD Contexts

The Verifiable Credentials specification uses contexts to ensure that the meanings of terms in a credential are shared by all parties.
For more information about this, see the [context documentation](./docs/contexts.md).

## Installation

Install using the [rush commands](../../README.md#installation) described in the root README.

## Running the app

Alternatively to `npm`, `pnpm` can be used for the commands below.

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```
### Swagger/OpenAPI

After starting the `vc-api` app, 
the Swagger/OpenAPI test page can be see at `{appURL}/api` (`http://localhost:3000/api` if running locally)

## Test

Alternatively to `npm`, `pnpm` can be used for the commands below.

```bash
# unit tests
$ npm run test:unit

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

### VC-API Module
An implementation of the [W3C Credentials Community Group](https://w3c-ccg.github.io/) [VC API Specification](https://w3c-ccg.github.io/universal-wallet-interop-spec/).
This spec provides a data model and HTTP protocols to issue, verify, present, and exchange verifiable credentials on the Web.
The [W3C Credentials Community Group](https://w3c-ccg.github.io/) also publishes [use cases for VC API](https://w3c-ccg.github.io/vc-api-use-cases/index.html).

#### Standard vs Custom Endpoints

Not all of the endpoints available from the VC-API app are standard.

| Profile | Purpose | Standard | Spec Link
| --- | --- | --- | --- |
| Issuing | Issue Credential | Yes | https://w3c-ccg.github.io/vc-api/#issue-credential
| Verifying | Verify Credential | Yes | https://w3c-ccg.github.io/vc-api/#verify-credential
| Verifying | Verify Presentation | Yes | https://w3c-ccg.github.io/vc-api/#verify-presentation
| Presenting | Prove Presentation | Yes | https://w3c-ccg.github.io/vc-api/#prove-presentation
| Presenting | Initiate Exchange | Yes | https://w3c-ccg.github.io/vc-api/#initiate-exchange
| Presenting | Continue Exchange | Yes | https://w3c-ccg.github.io/vc-api/#continue-exchange
| Presenting | Configure Exchange | No | 
| Presenting | Query Submissions | No |  
| Presenting | Submit Submission Review | No |
| Presenting | Create Presentation from Credentials | No |

### DID Module

The DID Module in the [vc-api](./) offers the generation of DIDs and tracking the data resolvable in their DID documents.

### Key Module
The key module is kept separate from the DID module because it's plausible that key module will be provided by a different service (i.e. a dedicated KMS) at some point.

#### Key Import/Export

The key module allows for the import and export of key pairs.
A tutorial demonstrating this available here: [Key Export/Import Tutorial](./docs/tutorials/key-export-import-tutorial.md)

## Database
Currently, the app uses an **in-memory DB** for now for app execution and tests.
The rationale for this for executions that, as the app is only being used in a demo context, it is not necessary to persist data between executions.
The rationale for this for tests (rather than mocking the db) is that it speeds test writing time, elimates mocking boilerplate and possibly buggy DB mocks.

## License

This project is licensed under the GNU General Public License v3.0 or later - see the [LICENSE](LICENSE) file for details
NestJs is [MIT licensed](LICENSE).
