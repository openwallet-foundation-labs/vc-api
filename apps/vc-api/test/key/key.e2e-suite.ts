/*
 * Copyright 2021 - 2023 Energy Web Foundation
 * SPDX-License-Identifier: Apache-2.0
 */

import { TypedArrayEncoder } from '@credo-ts/core';
import { walletClient } from '../app.e2e-spec';

export const keySuite = () => {
  it('should export keypair for generated did:key', async () => {
    const didDoc = await walletClient.createDID('key');
    const keyId = didDoc.verificationMethod[0].publicKeyBase58;
    const exportedKey = await walletClient.exportKey(keyId);
    expect(exportedKey).toBeDefined();
    expect(TypedArrayEncoder.toBase58(TypedArrayEncoder.fromBase64Url(exportedKey.publicKey.x))).toEqual(
      keyId
    );
  });

  it('should import and export a key', async () => {
    const keyPair = {
      privateKey: {
        crv: 'Ed25519',
        d: '6PUeBq8ogV4TH7jTWhBOseIHjxXJ-ldXA9Cvr_-lnCU',
        x: 'uh-elw-73L1j1P7OuXz4gpNG4tYE4F_QJw8D6NTYjBg',
        kty: 'OKP'
      },
      publicKey: {
        crv: 'Ed25519',
        x: 'uh-elw-73L1j1P7OuXz4gpNG4tYE4F_QJw8D6NTYjBg',
        kty: 'OKP',
        kid: 'DXYoBVg7eNenMbdevWsiycpSCc1txSUEeRd6Ek4TMcUo'
      }
    };
    const keyDescription = await walletClient.importKey(keyPair);
    const exportedKey = await walletClient.exportKey(keyDescription.keyId);
    expect(exportedKey).toEqual(keyPair);
  });

  it('should register a did:key from an imported key', async () => {
    const keyPair = {
      privateKey: {
        crv: 'Ed25519',
        d: 'XYinvK___oQmhBvL0LDJPmryrvXDNKebtFznjri2YWk',
        x: 'E5ljjWvsZZ2NYpDr7QDbit-WWKMxbzn3YgMjRa1dShQ',
        kty: 'OKP'
      },
      publicKey: {
        crv: 'Ed25519',
        x: 'E5ljjWvsZZ2NYpDr7QDbit-WWKMxbzn3YgMjRa1dShQ',
        kty: 'OKP',
        kid: '2KWQSazdFzSmkSZJx7YW77nvPLzyrf4SDcTYWY9sApjm'
      }
    };
    const keyDescription = await walletClient.importKey(keyPair);
    const createdDID = await walletClient.createDID('key', keyDescription.keyId);
    expect(createdDID.verificationMethod[0].publicKeyBase58).toEqual(keyDescription.keyId);

    // Should be able to reimport and create.
    // Operations are idempotent.
    const keyDescription2 = await walletClient.importKey(keyPair);
    const createdDID2 = await walletClient.createDID('key', keyDescription2.keyId);
    expect(createdDID2.verificationMethod[0].publicKeyBase58).toEqual(keyDescription2.keyId);
  });
};
