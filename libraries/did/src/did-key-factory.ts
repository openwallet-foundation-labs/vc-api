/*
 * Copyright 2021 - 2023 Energy Web Foundation
 * SPDX-License-Identifier: Apache-2.0
 */

import { Agent, KeyDidCreateOptions, TypedArrayEncoder } from '@credo-ts/core';
import { AskarModule } from '@credo-ts/askar';
import { DIDDocument } from 'did-resolver';

// multicodec prefix for an Ed25519 public key (0xed encoded as varint)
const ED25519_MULTICODEC_PREFIX = Uint8Array.from([0xed, 0x01]);

export class DIDKeyFactory {
  /**
   * Generate a new did:key DID for an Ed25519 key known to the agent's KMS.
   *
   * The method is idempotent: if a DID was already created for this key, its
   * DID document is returned (did:key DID documents cannot be mutated).
   *
   * @param agent Credo agent
   * @param keyId KMS keyId of an Ed25519 key
   * @returns The default DID Document of the DID
   */
  public static async generate(agent: Agent<{ askar: AskarModule }>, keyId: string): Promise<DIDDocument> {
    const publicJwk = await agent.kms.getPublicKey({ keyId });
    if (publicJwk.kty !== 'OKP' || publicJwk.crv !== 'Ed25519') {
      throw new Error(`did:key generation requires an Ed25519 key, got kty=${publicJwk.kty}`);
    }

    // did:key fingerprint = z + base58btc(multicodec-prefixed public key)
    const publicKeyBytes = TypedArrayEncoder.fromBase64Url(publicJwk.x);
    const fingerprint = `z${TypedArrayEncoder.toBase58(
      TypedArrayEncoder.concat([ED25519_MULTICODEC_PREFIX, publicKeyBytes])
    )}`;
    const did = `did:key:${fingerprint}`;

    // Creating the same DID twice fails on the duplicate DidRecord since
    // Credo 0.6, so return the existing document instead
    const [existing] = await agent.dids.getCreatedDids({ did });
    if (existing) {
      return (await agent.dids.resolveDidDocument(did)).toJSON() as DIDDocument;
    }

    const didCreateOptions: KeyDidCreateOptions = {
      method: 'key',
      options: {
        keyId
      }
    };

    const result = await agent.dids.create<KeyDidCreateOptions>(didCreateOptions);

    if (result.didState.didDocument) {
      return result.didState.didDocument.toJSON() as DIDDocument;
    } else {
      throw new Error(`Error generating did: ${JSON.stringify(result.didState)}`);
    }
  }
}
