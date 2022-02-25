import { Test, TestingModule } from '@nestjs/testing';
import { keyToDID, keyToVerificationMethod } from '@spruceid/didkit-wasm-node';
import { TypeOrmSQLiteModule } from '../in-memory-db';
import { VcApiService } from './vc-api.service';
import { IssueOptionsDto } from './dtos/issue-options.dto';
import { VerifyOptionsDto } from './dtos/verify-options.dto';
import { DIDService } from '../did/did.service';
import { KeyService } from '../key/key.service';
import { Presentation } from './exchanges/types/presentation';

const key = {
  kty: 'OKP',
  crv: 'Ed25519',
  x: 'gZbb93kdEoQ9Be78z7NG064wBq8Vv_0zR-qglxkiJ-g',
  d: 'XXugDYUEtINLUefOLeztqOOtPukVIvNPreMTzl6wKgA'
};
const did = keyToDID('key', JSON.stringify(key));

describe('VcApiService', () => {
  let service: VcApiService;
  let didService: DIDService;
  let keyService: KeyService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VcApiService,
        {
          provide: DIDService,
          useValue: {
            getVerificationMethod: jest.fn()
          }
        },
        {
          provide: KeyService,
          useValue: {
            getPrivateKeyFromKeyId: jest.fn()
          }
        }
      ]
    }).compile();

    didService = module.get<DIDService>(DIDService);
    keyService = module.get<KeyService>(KeyService);
    service = module.get<VcApiService>(VcApiService);
  });

  afterEach(async () => {
    jest.resetAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should issue a vc', async () => {
    const verificationMethod = await keyToVerificationMethod('key', JSON.stringify(key));
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
    const issuanceOptions: IssueOptionsDto = {
      proofPurpose: 'assertionMethod',
      verificationMethod: verificationMethod,
      created: '2021-11-16T14:52:19.514Z'
    };
    jest.spyOn(didService, 'getVerificationMethod').mockResolvedValueOnce({
      id: verificationMethod,
      type: 'some-verification-method-type',
      controller: did,
      publicKeyJwk: {
        kid: 'some-key-id',
        kty: 'OKP'
      }
    });
    jest.spyOn(keyService, 'getPrivateKeyFromKeyId').mockResolvedValueOnce(key);
    const vc = await service.issueCredential({ credential, options: issuanceOptions });
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

  it('should prove a vp', async () => {
    const verificationMethod = await keyToVerificationMethod('key', JSON.stringify(key));
    const issuingDID = 'did:key:z6MkoB84PJkXzFpbqtfYV5WqBKHCSDf7A1SeepwzvE36QvCF';
    const vc = {
      '@context': ['https://www.w3.org/2018/credentials/v1'],
      id: 'http://example.org/credentials/3731',
      type: ['VerifiableCredential'],
      credentialSubject: { id: 'did:example:d23dd687a7dc6787646f2eb98d0' },
      issuer: issuingDID,
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
    const presentation: Presentation = {
      '@context': [
        'https://www.w3.org/2018/credentials/v1',
        'https://www.w3.org/2018/credentials/examples/v1'
      ],
      type: ['VerifiablePresentation'],
      verifiableCredential: [vc]
    };
    const issuanceOptions: IssueOptionsDto = {
      proofPurpose: 'assertionMethod',
      verificationMethod: verificationMethod,
      created: '2021-11-16T14:52:19.514Z'
    };
    jest.spyOn(didService, 'getVerificationMethod').mockResolvedValueOnce({
      id: verificationMethod,
      type: 'some-verification-method-type',
      controller: did,
      publicKeyJwk: {
        kid: 'some-key-id',
        kty: 'OKP'
      }
    });
    jest.spyOn(keyService, 'getPrivateKeyFromKeyId').mockResolvedValueOnce(key);
    const vp = await service.provePresentation({ presentation, options: issuanceOptions });
    const expectedVp = {
      '@context': [
        'https://www.w3.org/2018/credentials/v1',
        'https://www.w3.org/2018/credentials/examples/v1'
      ],
      type: ['VerifiablePresentation'],
      verifiableCredential: [
        {
          '@context': ['https://www.w3.org/2018/credentials/v1'],
          id: 'http://example.org/credentials/3731',
          type: ['VerifiableCredential'],
          credentialSubject: {
            id: 'did:example:d23dd687a7dc6787646f2eb98d0'
          },
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
        }
      ],
      proof: {
        type: 'Ed25519Signature2018',
        proofPurpose: 'assertionMethod',
        verificationMethod:
          'did:key:z6MkoB84PJkXzFpbqtfYV5WqBKHCSDf7A1SeepwzvE36QvCF#z6MkoB84PJkXzFpbqtfYV5WqBKHCSDf7A1SeepwzvE36QvCF',
        created: '2021-11-16T14:52:19.514Z',
        jws: 'eyJhbGciOiJFZERTQSIsImNyaXQiOlsiYjY0Il0sImI2NCI6ZmFsc2V9..RuGboEsIpXLG_zASMzmSIVReq93QEg6JznIdE5SpyZnYWDGGecBQiFostRBOdDjbf99vrd7oNEQt29qGSDt7CQ'
      }
    };
    expect(vc['proof']['jws']).toBeDefined();
    /**
     * Delete jws from proof as it is not deterministic
     * TODO: confirm this from the Ed25519Signature2018 spec
     */
    delete vp.proof.jws;
    delete expectedVp.proof.jws;
    expect(vp).toEqual(expectedVp);
  });

  it('should be able to verify a credential', async () => {
    const verifyOptions: VerifyOptionsDto = {};
    const vc = {
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
    const result = await service.verifyCredential(vc, verifyOptions);
    const expectedResult = { checks: ['proof'], warnings: [], errors: [] };
    expect(result).toEqual(expectedResult);
  });

  it('should be able to generate DIDAuth', async () => {
    const verificationMethod = await keyToVerificationMethod('key', JSON.stringify(key));
    const challenge = '2679f7f3-d9ff-4a7e-945c-0f30fb0765bd';
    const issuanceOptions: IssueOptionsDto = {
      proofPurpose: 'authentication',
      verificationMethod: verificationMethod,
      created: '2021-11-16T14:52:19.514Z',
      challenge
    };
    jest.spyOn(didService, 'getVerificationMethod').mockResolvedValueOnce({
      id: verificationMethod,
      type: 'some-verification-method-type',
      controller: did,
      publicKeyJwk: {
        kid: 'some-key-id',
        kty: 'OKP'
      }
    });
    jest.spyOn(keyService, 'getPrivateKeyFromKeyId').mockResolvedValueOnce(key);
    const vp = await service.didAuthenticate({ did, options: issuanceOptions });
    expect(vp.holder).toEqual(did);
    expect(vp.proof).toBeDefined();
    const authVerification = await service.verifyPresentation(vp, { challenge });
    expect(authVerification.checks).toHaveLength(1);
    expect(authVerification.checks[0]).toEqual('proof');
    expect(authVerification.errors).toHaveLength(0);
  });
});
