import { ISecp256k1KeyGen } from '@energyweb/ssi-kms-interface';
import { EthrDIDFactory } from '..';

describe.only('EthrDIDFactory', () => {
  it('should create did', async () => {
    // copied from https://w3c-ccg.github.io/lds-ecdsa-secp256k1-2019/#example-1
    const publicKeyJWK = {
      crv: 'secp256k1',
      kid: 'JUvpllMEYUZ2joO59UNui_XYDqxVqiFLLAJ8klWuPBw',
      kty: 'EC',
      x: 'dWCvM4fTdeM0KmloF57zxtBPXTOythHPMm1HCLrdd3A',
      y: '36uMVGM7hnw-N6GnjFcihWE3SkrhMLzzLCdPMXPEXlA'
    };
    const mockKeyGen: ISecp256k1KeyGen = {
      generateSecp256k1: () => Promise.resolve(publicKeyJWK)
    };
    const factory = new EthrDIDFactory(mockKeyGen);
    const didDocument = await factory.generate();
    expect(didDocument.id).toEqual('did:ethr:volta:0x346E9a6197A01dF272b873975ECbc5e190043E73');
    expect(didDocument.verificationMethod?.length).toEqual(1);
    expect(didDocument.verificationMethod![0].publicKeyJwk).toMatchObject(publicKeyJWK);
  });
});
