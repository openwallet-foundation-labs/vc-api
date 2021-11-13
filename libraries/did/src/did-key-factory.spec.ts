import { IEd25519KeyGen } from '@energyweb/ssi-kms-interface';
import { DIDKeyFactory } from './did-key-factory';

describe.only('DIDKeyFactory', () => {
  it('should create did', async () => {
    const publicKeyJWK = {
      kty: 'OKP',
      crv: 'Ed25519',
      x: 'l5weWO83oqUve6Q5SJncYvRqnONyJWaRi3eKUMhUU38',
      kid: 'n3mdJC_7o3016F8StU_oR9R-AePnpKZFJ8gRaZTSoZU'
    };
    const mockKeyGen: IEd25519KeyGen = {
      generateEd25119: () => Promise.resolve(publicKeyJWK)
    };
    const factory = new DIDKeyFactory(mockKeyGen);
    const didDocument = await factory.generate();
    expect(didDocument.id).toEqual('did:key:z6Mkpf5gPMANfqmgCfzDye4kCnLRwC7mtqrtjZ3J87AjKddx');
    expect(didDocument.verificationMethod?.length).toEqual(1);
    const verificationMethod = didDocument.verificationMethod![0];
    expect(verificationMethod.publicKeyJwk).toMatchObject(publicKeyJWK);

    // From https://www.w3.org/TR/did-core/#verification-material :
    // "It is RECOMMENDED that verification methods that use JWKs [RFC7517] to represent their public keys use the value of kid as their fragment identifier."
    expect(verificationMethod.id.split('#')[1]).toEqual(verificationMethod.publicKeyJwk?.kid);
  });
});
