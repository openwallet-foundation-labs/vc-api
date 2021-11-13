import keyto from '@trust/keyto';
import { DIDDocument, VerificationMethod } from 'did-resolver';
import { verificationMethodTypes } from 'ethr-did-resolver';
import { utils } from 'ethers';
import { DifJsonWebKey } from '.';

const { computeAddress } = utils;

export class DIDEthrFactory {
  /**
   * Generate a new did:ethr DID from an secp256k1 public key
   * @returns The default DID Document of the DID. E.g. https://github.com/decentralized-identity/ethr-did-resolver#did-document
   */
  public static async generate(secp256k1PublicKey: DifJsonWebKey): Promise<DIDDocument> {
    // TODO: confirm that key passed as param is actually an secp256k1 key

    // Converting from JWK to hex as this is what ethers computeAddress function accepts
    // Use of keyto inspired by https://github.com/decentralized-identity/EcdsaSecp256k1RecoverySignature2020/blob/3b6dc297f92abc912049121c38c1098d819855d2/src/ES256K-R.js#L48
    const uncompressedPublicKey = keyto
      .from(
        {
          ...secp256k1PublicKey,
          crv: 'K-256'
        },
        'jwk'
      )
      .toString('blk', 'public');
    const address = computeAddress(`0x${uncompressedPublicKey}`);

    // Assuming EWF Volta chain to start
    // TODO: make more flexible
    const did = `did:ethr:volta:${address}`;
    const VOLTA_CHAIN_ID = '73799';

    // Copied from https://github.com/decentralized-identity/ethr-did-resolver/blob/d6ebdfc15059b8e5c4cc8b4c3fd6a32ad3f295eb/src/resolver.ts#L261
    // TODO: It would be ideal if the ethr-did-resolver package could be used to generate the default DID document but I think this would require connect to a chain
    const defaultVerificationMethod: VerificationMethod = {
      id: `${did}#controller`,
      type: verificationMethodTypes.EcdsaSecp256k1RecoveryMethod2020,
      controller: did,
      blockchainAccountId: `${address}@eip155:${VOLTA_CHAIN_ID}`
    };

    /**
     * Setting the publicKeyJwk here so we can reference the controlling key of this ethr DID by the thumbprint.
     * Need to set kty because it is possibly undefined in 'jose' JWK type
     */
    defaultVerificationMethod.publicKeyJwk = { ...secp256k1PublicKey, kty: 'EC' };

    return {
      id: did,
      verificationMethod: [defaultVerificationMethod]
    };
  }
}
