import { Test, TestingModule } from '@nestjs/testing';
import { generateEd25519Key, keyToDID, keyToVerificationMethod } from '@spruceid/didkit-wasm-node';
import { JWK } from 'jose';
import { CredentialsService } from './credentials.service';

describe('CredentialsService', () => {
  let service: CredentialsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CredentialsService]
    }).compile();

    service = module.get<CredentialsService>(CredentialsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should be able to issue a credential', async () => {
    const key =
      '{"kty":"OKP","crv":"Ed25519","x":"gZbb93kdEoQ9Be78z7NG064wBq8Vv_0zR-qglxkiJ-g","d":"XXugDYUEtINLUefOLeztqOOtPukVIvNPreMTzl6wKgA"}';
    const did = keyToDID('key', key);
    const verificationMethod = await keyToVerificationMethod('key', key);
    const credential = {
      '@context': ['https://www.w3.org/2018/credentials/v1'],
      id: 'http://example.org/credentials/3731',
      type: ['VerifiableCredential'],
      issuer: did,
      issuanceDate: '2020-08-19T21:41:50Z',
      credentialSubject: {
        id: 'did:example:d23dd687a7dc6787646f2eb98d0'
      }
    };
    const proofOptions = {
      proofPurpose: 'assertionMethod',
      verificationMethod: verificationMethod,
      created: '2021-11-16T14:52:19.514Z'
    };
    const jsonWebKey: JWK = JSON.parse(key);
    const vc = JSON.parse(await service.issueCredential(credential, proofOptions, jsonWebKey));
    const expectedVc = {
      '@context': ['https://www.w3.org/2018/credentials/v1'],
      id: 'http://example.org/credentials/3731',
      type: ['VerifiableCredential'],
      credentialSubject: { id: 'did:example:d23dd687a7dc6787646f2eb98d0' },
      issuer: 'did:key:z6MkoB84PJkXzFpbqtfYV5WqBKHCSDf7A1SeepwzvE36QvCF',
      issuanceDate: '2020-08-19T21:41:50Z',
      proof: {
        type: 'Ed25519Signature2018',
        proofPurpose: 'assertionMethod',
        verificationMethod:
          'did:key:z6MkoB84PJkXzFpbqtfYV5WqBKHCSDf7A1SeepwzvE36QvCF#z6MkoB84PJkXzFpbqtfYV5WqBKHCSDf7A1SeepwzvE36QvCF',
        created: '2021-11-16T14:52:19.514Z',
        jws: 'eyJhbGciOiJFZERTQSIsImNyaXQiOlsiYjY0Il0sImI2NCI6ZmFsc2V9..9N2qqOBBcQkJv_tF1DObaVRovT8nbuDLV1VMFk5sEd_WNKCcdGsPzNoOqVAJI7rCmzgqCtN_dZtzKrtnPZioDg'
      }
    };
    expect(vc['proof']['jws']).toBeDefined();
    /**
     * Delete jws from proof as it is not deterministic
     * TODO: confirm this from the Ed25519Signature2018 spec
     */
    delete vc.proof.jws;
    delete expectedVc.proof.jws;
    expect(vc).toEqual(expectedVc);
  });
});
