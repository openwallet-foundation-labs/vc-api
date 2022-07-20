## Description

This [credential-from-input-descriptor app](./) is a NestJs implementation of a complementary service to
the [vc-api app](../vc-api). It allows converting an input descriptor to a credential to be signed.

## Installation

Install using the [rush commands](../../README.md#installation) described in the root README.

## Running the app

Alternatively to `npm`, `pnpm`, `rushx` can be used for the commands below.

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

### Swagger/OpenAPI

After starting the `credential-from-input-descriptor app` app, the Swagger/OpenAPI test page can be see at `{appURL}/api`
([`http://localhost:3000/api`](http://localhost:3000/api)
if running locally)

### Port number

To change the port number application binds to, set `PORT` env variable:

```bash
PORT=3001 npm run start
```

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

## Docker image

### Building

To build a docker image, execute the following from the repository root:

```bash
docker build -f apps/credential-from-input-descriptor/Dockerfile -t input-descriptor-to-credential-converter .
```

### Starting

```shell
docker run -p 3000:3000 --name converter input-descriptor-to-credential-converter
```
