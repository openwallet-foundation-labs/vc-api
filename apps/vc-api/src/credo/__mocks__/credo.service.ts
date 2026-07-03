import { Kms } from '@credo-ts/core';

/**
 * In-memory stand-in for the agent's KMS: importKey stores the private JWK
 * under its kid, getPublicKey returns the public part or throws the same
 * not-found error as the real KMS.
 */
const kmsKeys = new Map<string, Record<string, unknown>>();

export const resetMockKms = () => kmsKeys.clear();

export const mockCredoService = {
  withAskarSession: jest.fn(),
  agent: {
    kms: {
      importKey: jest.fn(async ({ privateJwk }) => {
        kmsKeys.set(privateJwk.kid, privateJwk);
        const { d: _d, ...publicJwk } = privateJwk; // eslint-disable-line @typescript-eslint/no-unused-vars
        return { keyId: privateJwk.kid, publicJwk };
      }),
      getPublicKey: jest.fn(async ({ keyId }) => {
        const jwk = kmsKeys.get(keyId);
        if (!jwk) {
          throw new Kms.KeyManagementKeyNotFoundError(keyId, ['askar']);
        }
        const { d: _d, ...publicJwk } = jwk; // eslint-disable-line @typescript-eslint/no-unused-vars
        return { ...publicJwk, kid: keyId };
      })
    },
    dids: {
      getCreatedDids: jest.fn().mockResolvedValue([]),
      create: jest.fn(),
      resolveDidDocument: jest.fn()
    },
    w3cCredentials: {
      signCredential: jest.fn(),
      verifyCredential: jest.fn(),
      signPresentation: jest.fn(),
      verifyPresentation: jest.fn()
    }
  }
};
