import { keyToDID, keyToVerificationMethod } from '@spruceid/didkit-wasm-node';
import { DIDDocument, VerificationMethod } from 'did-resolver';
import { verificationMethodTypes } from 'ethr-did-resolver';
import { DifJsonWebKey } from '.';

export class DIDKeyFactory {
  /**
   * Generate a new did:key DID from a public JWK
   * Currently, only Ed25519 keys are supported
   * @returns The default DID Document of the DID. E.g. https://github.com/decentralized-identity/ethr-did-resolver#did-document
   */
  public static async generate(ed25119Key: DifJsonWebKey): Promise<DIDDocument> {
    const did = await keyToDID('key', JSON.stringify(ed25119Key));

    const id = await keyToVerificationMethod('key', JSON.stringify(ed25119Key));
    const verificationMethod: VerificationMethod = {
      id,
      type: verificationMethodTypes.Ed25519VerificationKey2018,
      controller: did,
      publicKeyJwk: ed25119Key
    };

    return {
      id: did,
      verificationMethod: [verificationMethod]
    };
  }
}
