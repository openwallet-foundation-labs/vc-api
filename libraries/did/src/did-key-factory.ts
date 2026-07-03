/*
 * Copyright 2021 - 2023 Energy Web Foundation
 * SPDX-License-Identifier: Apache-2.0
 */

import { Agent, Key, KeyDidCreateOptions, KeyType, Ed25519Jwk } from '@credo-ts/core';
import { AskarModule } from '@credo-ts/askar';
import { DIDDocument } from 'did-resolver';
import { DifJsonWebKey } from '.';

export class DIDKeyFactory {
  /**
   * Generate a new did:key DID from a public JWK
   * Currently, only Ed25519 keys are supported
   * @returns The default DID Document of the DID. E.g. https://github.com/decentralized-identity/ethr-did-resolver#did-document
   */
  public static async generate(
    agent: Agent<{ askar: AskarModule }>,
    ed25119Key: DifJsonWebKey
  ): Promise<DIDDocument> {
    const ed25519Jwk = new Ed25519Jwk({ x: ed25119Key.x! });
    const credoKey: Key = new Key(ed25519Jwk.publicKey, KeyType.Ed25519);

    const didCreateOptions: KeyDidCreateOptions = {
      method: 'key',
      options: {
        key: credoKey
      }
    };

    const did = await agent.dids.create(didCreateOptions);

    if (did.didState.didDocument) {
      return did.didState.didDocument;
    } else {
      throw new Error('Error generating did');
    }
  }
}
