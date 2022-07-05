# API versioning concepts

## Introduction

URI api versioning seems to be most convenient way of versioning endpoints. Other choices are:

* Header Versioning
* Media type versioning

Both based on http request headers.

It is possible to set default version(s) for all endpoints:

```typescript
app.enableVersioning({
  type: VersioningType.URI,
  defaultVersion: ['1']
});
```

As a result, all enpoints will be prefixed with a version
number(s). For instance, `/key/{keyId}` will become `/v1/key/{keyId}` and `/key/{keyId}` will respond
with `404 Not Found`.

No other code changes are required. We have v1 of all existing endpoints. Swagger document is also adjusted
automatically.

This version number can be kept until need of handling breaking changes. Not every breaking change should result in
creation of next api versions. Only in case of customers using our solution in a way that prevents adjusting to changes.

## Next steps

In situation when introducing breaking change and in a need of keeping an old endpoint version, we can proceed in few
ways.

### 1. Single default "base" versions, some endpoints code split into multiple versions

This approach introduces a new version, but only for endpoints that need to have breaking changes to be implemented.
This is achieved by:

* keeping `defaultVersion` unchanged
* splitting endpoints code having breaking changes and annotating them with decorators.

```typescript
app.enableVersioning({
  type: VersioningType.URI,
  defaultVersion: ['1']
});
```

```typescript
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {
  }

  // this is available on v1
  @Get()
  getHelloV1(): string {
    return 'version 1';
  }

  // this is available on v2
  @Version(['2'])
  @Get()
  getHelloV2(): string {
    return 'version 2';
  }

  // this is available on v1 only
  @Get('/bye')
  getBye(): string {
    return 'bye'
  }
}
```

After the old version is deprecated, the following is needed:

* changing `defaultVersion` to the next version
* removal of all the code used by the old versions endpoints with breaking changes
* removal of all the annotations setting the next version for endpoints with breaking changes

#### Pros:
* Little code to be annotated
* All versions served by single instance of the application

#### Cons:
* No equivalent for most of the endpoints in a new version

### 2. Multiple default versions, some endpoints code split into multiple versions

This approach introduces a new version for all endpoints - unchanged and with breaking changes. As a result, all
endpoint are going to behave exactly the same when prepended with `v1/` or `v2/` except for endpoints that introduced
breaking change.

This approach requires:

* adding another `defaultVersion`.
* splitting endpoints code having breaking changes and annotating them with decorators.

```typescript
app.enableVersioning({
  type: VersioningType.URI,
  defaultVersion: ['1', '2']
});
```

```typescript
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  // this is available on v1
  @Version(['1'])
  @Get()
  getHelloV1(): string {
    return 'version 1';
  }

  // this is available on v2
  @Version(['2'])
  @Get()
  getHelloV2(): string {
    return 'version 2';
  }

  // this is available on both v1 and v2
  @Get('/bye')
  getBye(): string {
    return 'bye'
  }
}
```

When old version is deprecated, two things need to be done:

* removing of the old version from the `defaultVersions`
* removing of all the code used by the old versions endpoints

#### Pros:

* Little code to be annotated
* All versions served by single instance of the application

#### Cons:

* Confusion made by the same logic with multiple versions.

### 3. Moving all endpoints to the new "base" version, some endpoints code split into multiple versions

This approach introduces a new version for all endpoints, moving all endpoint to the new version except endpoints with a
breaking change introduced.

This requires:
* replacing `defaultVersion` value with a new version
* splitting endpoints code having breaking changes and annotating them with decorators

```typescript
app.enableVersioning({
  type: VersioningType.URI,
  defaultVersion: ['2']
});
```

```typescript
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  // this is available on v1
  @Version(['1'])
  @Get()
  getHelloV1(): string {
    return 'version 1';
  }

  // this is available on v2
  @Version(['2'])
  @Get()
  getHelloV2(): string {
    return 'version 2';
  }

  // this is available on v2 only
  @Get('/bye')
  getBye(): string {
    return 'bye'
  }
}
```

When the old version is deprecated one thing needs to be done:

* removal of all the code used by the old versions endpoints

#### Pros:

* little code to be annotated
* all versions served by single instance of the application

#### Cons:

* clients need to change calls to the new version as soon as single breaking change is introduced

### 4. Forking whole code into multiple branches with different single versions.

This approach moves all endpoints to a new version while keeping the old version code maintained in a branch.

This requires:
* replacing `defaultVersion` value with a new version on a main branch
* keeping `defaultVersion` value on an old version maintenance branch

When the old version is deprecated, only information nedds to be published that it is no longer supported.

#### Pros:
* no endpoints need to be annotated
* no code needs to be split within one codebase version
* no code changes required after old version is deprecated

#### Cons:
* maintenance branch needs to be updated with selected changes from the main branch
* multiple instances needs to be started to serve both versions (API gateway required)
