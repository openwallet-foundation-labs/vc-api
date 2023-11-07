/*
 * Copyright 2021 - 2023 Energy Web Foundation
 * SPDX-License-Identifier: Apache-2.0
 */

import { walletClient } from '../app.e2e-spec';

export const keySuite = () => {
  it('should export keypair for generated did:key', async () => {
    const didDoc = await walletClient.createDID('key');
    const didDocPubKey = didDoc.verificationMethod[0].publicKeyJwk;
    const keyId = didDocPubKey.kid;
    const exportedKey = await walletClient.exportKey(keyId);
    expect(exportedKey).toBeDefined();
    expect(exportedKey.publicKey).toEqual(didDocPubKey);
  });

  it('should import and export a key', async () => {
    const keyPair = {
      publicKeyThumbprint: 'AVjSzgwrxmpi4AGnt32kvb2LgAh6ZHdmesW0RPIdMg0',
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
        kid: 'AVjSzgwrxmpi4AGnt32kvb2LgAh6ZHdmesW0RPIdMg0'
      }
    };
    const keyDescription = await walletClient.importKey(keyPair);
    const exportedKey = await walletClient.exportKey(keyDescription.keyId);
    expect(exportedKey).toEqual(keyPair);
  });

  it('should register a did:key from an imported key', async () => {
    const keyPair = {
      publicKeyThumbprint: 'MW-TUkCospd6AC16JkoD1-Iun1GxGLGSv6Z-48CfSj4',
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
        kid: 'MW-TUkCospd6AC16JkoD1-Iun1GxGLGSv6Z-48CfSj4'
      }
    };
    const keyDescription = await walletClient.importKey(keyPair);
    const createdDID = await walletClient.createDID('key', keyDescription.keyId);
    expect(createdDID.verificationMethod[0].publicKeyJwk.kid).toEqual(keyDescription.keyId);

    // Should be able to reimport and create.
    // Operations are idempotent.
    const keyDescription2 = await walletClient.importKey(keyPair);
    const createdDID2 = await walletClient.createDID('key', keyDescription2.keyId);
    expect(createdDID2.verificationMethod[0].publicKeyJwk.kid).toEqual(keyDescription2.keyId);
  });
};
