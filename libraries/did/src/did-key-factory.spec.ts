/*
 * Copyright 2021 - 2023 Energy Web Foundation
 * SPDX-License-Identifier: Apache-2.0
 */

// IMPORTANT: '@openwallet-foundation/askar-nodejs' must be imported before any
// '@credo-ts/*' package so the native askar binding is registered before the
// ESM-only Credo packages snapshot it (see CredoService in apps/vc-api)
import { askar } from '@openwallet-foundation/askar-nodejs';
import { AskarModule } from '@credo-ts/askar';
import { DIDKeyFactory } from './did-key-factory';
import { Agent, TypedArrayEncoder } from '@credo-ts/core';
import { agentDependencies } from '@credo-ts/node';

describe('DIDKeyFactory', () => {
  let agent: Agent<{
    askar: AskarModule;
  }>;
  beforeEach(async function () {
    // create agent - here Aries Askar
    agent = new Agent({
      config: {},
      dependencies: agentDependencies,
      modules: {
        // Register the Askar module on the agent
        askar: new AskarModule({
          askar,
          store: {
            id: 'wallet-test',
            key: 'testkey0000000000000000000000000',
            database: {
              type: 'sqlite',
              config: {
                inMemory: true
              }
            }
          }
        })
      }
    });

    // operations in the credo wallet can only be performed once the agent is initialized
    await agent.initialize();
  });

  afterEach(async function () {
    await agent.shutdown();
  });

  it('should create did', async () => {
    const { keyId, publicJwk } = await agent.kms.createKey({
      type: { kty: 'OKP', crv: 'Ed25519' }
    });

    const didDocument = await DIDKeyFactory.generate(agent, keyId);

    const publicKeyBase58 = TypedArrayEncoder.toBase58(TypedArrayEncoder.fromBase64Url(publicJwk.x));
    expect(didDocument.id).toMatch(/^did:key:z/);
    expect(didDocument.verificationMethod?.length).toEqual(1);
    const verificationMethod = didDocument.verificationMethod![0];
    expect(verificationMethod.publicKeyBase58).toEqual(publicKeyBase58);
  });

  it('should return the existing did document when called twice for the same key', async () => {
    const { keyId } = await agent.kms.createKey({
      type: { kty: 'OKP', crv: 'Ed25519' }
    });

    const first = await DIDKeyFactory.generate(agent, keyId);
    const second = await DIDKeyFactory.generate(agent, keyId);

    expect(second.id).toEqual(first.id);
    expect(second.verificationMethod?.[0]?.publicKeyBase58).toEqual(
      first.verificationMethod?.[0]?.publicKeyBase58
    );
  });
});
