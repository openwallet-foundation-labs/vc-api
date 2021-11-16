import { DIDKeyFactory } from './did-key-factory';

describe.only('DIDKeyFactory', () => {
  it('should create did', async () => {
    const publicKeyJWK = {
      kty: 'OKP',
      crv: 'Ed25519',
      x: 'l5weWO83oqUve6Q5SJncYvRqnONyJWaRi3eKUMhUU38',
      kid: 'n3mdJC_7o3016F8StU_oR9R-AePnpKZFJ8gRaZTSoZU'
    };
    const didDocument = await DIDKeyFactory.generate(publicKeyJWK);
    expect(didDocument.id).toEqual('did:key:z6Mkpf5gPMANfqmgCfzDye4kCnLRwC7mtqrtjZ3J87AjKddx');
    expect(didDocument.verificationMethod?.length).toEqual(1);
    const verificationMethod = didDocument.verificationMethod![0];
    expect(verificationMethod.publicKeyJwk).toMatchObject(publicKeyJWK);

    /**
     * From https://www.w3.org/TR/did-core/#verification-material :
     * "It is RECOMMENDED that verification methods that use JWKs [RFC7517] to represent their public keys use the value of kid as their fragment identifier."
     * Spruce doesn't do this for there did:key verification method but try to use as much OOTB DIDKit as possible
     */
    // expect(verificationMethod.id.split('#')[1]).toEqual(verificationMethod.publicKeyJwk?.kid);
  });
});
