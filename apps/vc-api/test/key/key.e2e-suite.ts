/**
 * Copyright 2021, 2022 Energy Web Foundation
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
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
};