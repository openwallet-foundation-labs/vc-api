/*
 * Copyright 2021 - 2023 Energy Web Foundation
 * SPDX-License-Identifier: Apache-2.0
 */

import { AskarModule } from '@credo-ts/askar';
import { DIDKeyFactory } from './did-key-factory';
import { Agent, InitConfig, TypedArrayEncoder } from '@credo-ts/core';
import { agentDependencies } from '@credo-ts/node';
import { ariesAskar } from '@hyperledger/aries-askar-nodejs';

describe('DIDKeyFactory', () => {
  let agent: Agent<{
    askar: AskarModule;
  }>;
  beforeEach(async function () {
    const config: InitConfig = {
      label: 'wallet-test-askar',
      walletConfig: {
        id: 'wallet-test',
        key: 'testkey0000000000000000000000000',
        storage: {
          type: 'sqlite',
          config: {
            inMemory: true
          }
        }
      }
    };

    // create agent - here Aries Askar
    agent = new Agent({
      config,
      dependencies: agentDependencies,
      modules: {
        // Register the Askar module on the agent
        askar: new AskarModule({
          ariesAskar
        })
      }
    });

    // operations in the credo wallet can only be performed once the agent is initialized
    await agent.initialize();
  });

  afterEach(async function () {
    await agent.wallet.close();
    await agent.wallet.delete();
    await agent.shutdown();
  });

  it('should create did', async () => {
    const publicKeyJWK = {
      kty: 'OKP',
      crv: 'Ed25519',
      x: 'l5weWO83oqUve6Q5SJncYvRqnONyJWaRi3eKUMhUU38'
    };
    const didDocument = await DIDKeyFactory.generate(agent, publicKeyJWK);
    expect(didDocument.id).toEqual('did:key:z6Mkpf5gPMANfqmgCfzDye4kCnLRwC7mtqrtjZ3J87AjKddx');
    expect(didDocument.verificationMethod?.length).toEqual(1);
    const verificationMethod = didDocument.verificationMethod![0];
    expect(verificationMethod.publicKeyBase58).toEqual(
      TypedArrayEncoder.toBase58(TypedArrayEncoder.fromBase64(publicKeyJWK.x))
    );

    /**
     * From https://www.w3.org/TR/did-core/#verification-material :
     * "It is RECOMMENDED that verification methods that use JWKs [RFC7517] to represent their public keys use the value of kid as their fragment identifier."
     * Spruce doesn't do this for there did:key verification method but try to use as much OOTB DIDKit as possible
     */
    // expect(verificationMethod.id.split('#')[1]).toEqual(verificationMethod.publicKeyJwk?.kid);
  });
});
