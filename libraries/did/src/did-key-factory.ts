import { IEd25519KeyGen } from '@energyweb/ssi-kms-interface';
import { keyToDID } from '@spruceid/didkit-wasm-node';
import { DIDDocument, VerificationMethod } from 'did-resolver';
import { verificationMethodTypes } from 'ethr-did-resolver';
import { JWK } from 'jose';

export class DIDKeyFactory {
  private readonly _keyGen: IEd25519KeyGen;
  public constructor(keyGen: IEd25519KeyGen) {
    this._keyGen = keyGen;
  }

  /**
   * Generate a new did:ethr DID
   * @returns The default DID Document of the DID. E.g. https://github.com/decentralized-identity/ethr-did-resolver#did-document
   */
  public async generate(): Promise<DIDDocument> {
    const key: JWK = await this._keyGen.generateEd25119();
    const did = await keyToDID('key', JSON.stringify(key));

    /**
     * Not using Spruce DIDKit keyToVerificationMethod because it doesn't seem to use RFC7638 for kid & verificationMethod id fragment
     */
    const id = `${did}#${key.kid}`;
    // const id = await keyToVerificationMethod('key', JSON.stringify(key));
    const verificationMethod: VerificationMethod = {
      id,
      type: verificationMethodTypes.Ed25519VerificationKey2018,
      controller: did
    };

    /**
     * Setting the publicKeyJwk here so we can reference the controlling key of this ethr DID by the thumbprint.
     * Need to set kty because it is possibly undefined in 'jose' JWK type
     */
    verificationMethod.publicKeyJwk = { ...key, kty: 'OKP' };

    return {
      id: did,
      verificationMethod: [verificationMethod]
    };
  }
}
