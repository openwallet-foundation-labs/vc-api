import { DIDDocument, VerificationMethod } from 'did-resolver';
import { verificationMethodTypes } from 'ethr-did-resolver';
import { DifJsonWebKey } from '.';
import { keyToDID, keyToVerificationMethod } from '@spruceid/didkit-wasm-node';

export class DIDEthrFactory {
  /**
   * Generate a new did:ethr DID from an secp256k1 public key
   * @returns The default DID Document of the DID. E.g. https://github.com/decentralized-identity/ethr-did-resolver#did-document
   */
  public static async generate(secp256k1PublicKey: DifJsonWebKey): Promise<DIDDocument> {
    // TODO: confirm that key passed as param is actually an secp256k1 key (or add tests to confirm that this check is being done)
    const did = await keyToDID('ethr', JSON.stringify(secp256k1PublicKey));
    const address = did.split(':').pop();

    // Format taken from https://github.com/decentralized-identity/ethr-did-resolver/blob/d6ebdfc15059b8e5c4cc8b4c3fd6a32ad3f295eb/src/resolver.ts#L261
    // TODO: Maybe it would be better if the ethr-did-resolver package could be used to generate the default DID document
    const verificationMethodId = await keyToVerificationMethod('ethr', JSON.stringify(secp256k1PublicKey));
    const defaultVerificationMethod: VerificationMethod = {
      id: verificationMethodId,
      type: verificationMethodTypes.EcdsaSecp256k1RecoveryMethod2020,
      controller: did,
      blockchainAccountId: `${address}`,
      publicKeyJwk: secp256k1PublicKey
    };

    return {
      id: did,
      verificationMethod: [defaultVerificationMethod]
    };
  }
}
