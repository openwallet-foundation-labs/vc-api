import { Test, TestingModule } from '@nestjs/testing';
import { keyToDID, keyToVerificationMethod } from '@spruceid/didkit-wasm-node';
import { CredentialsService } from './credentials.service';
import { IssueOptionsDto } from './dtos/issue-options.dto';
import { VerifyOptionsDto } from './dtos/verify-options.dto';
import { DIDService } from '../../did/did.service';
import { KeyService } from '../../key/key.service';
import { Presentation } from '../exchanges/types/presentation';
import { ProofPurpose } from '@sphereon/pex';
import { VerifiableCredential } from '../exchanges/types/verifiable-credential';
import { CredentialDto } from './dtos/credential.dto';

const key = {
  kty: 'OKP',
  crv: 'Ed25519',
  x: 'gZbb93kdEoQ9Be78z7NG064wBq8Vv_0zR-qglxkiJ-g',
  d: 'XXugDYUEtINLUefOLeztqOOtPukVIvNPreMTzl6wKgA'
};
const did = keyToDID('key', JSON.stringify(key));

const credential: CredentialDto = {
  '@context': [
    'https://www.w3.org/2018/credentials/v1',
    {
      issuerFields: {
        '@id': 'ew:issuerFields',
        '@type': 'ew:IssuerFields'
      },
      namespace: 'ew:namespace',
      role: {
        '@id': 'ew:role',
        '@type': 'ew:Role'
      },
      ew: 'https://energyweb.org/ld-context-2022#',
      version: 'ew:version',
      EWFRole: 'ew:EWFRole'
    }
  ],
  id: 'urn:uuid:7f94d397-3e70-4a43-945e-1a13069e636f',
  type: ['VerifiableCredential', 'EWFRole'],
  credentialSubject: {
    id: 'did:example:d23dd687a7dc6787646f2eb98d0',
    issuerFields: [],
    role: {
      namespace: 'test.iam.ewc',
      version: '1'
    }
  },
  issuer: did,
  issuanceDate: '2022-03-18T08:57:32.477Z'
};
const vc: VerifiableCredential = {
  ...credential,
  proof: {
    type: 'Ed25519Signature2018',
    proofPurpose: 'assertionMethod',
    verificationMethod:
      'did:key:z6MkoB84PJkXzFpbqtfYV5WqBKHCSDf7A1SeepwzvE36QvCF#z6MkoB84PJkXzFpbqtfYV5WqBKHCSDf7A1SeepwzvE36QvCF',
    created: '2021-11-16T14:52:19.514Z',
    jws: 'eyJhbGciOiJFZERTQSIsImNyaXQiOlsiYjY0Il0sImI2NCI6ZmFsc2V9..CTodsuvLnodd4nhlxHA39XA0BSfjf6p0rsMgApBmIMRz2MOBF2WnK_2Fd5RBJ-SxRmqvFqa-eJy1LWF74gDUBw'
  }
};
const presentation: Presentation = {
  '@context': ['https://www.w3.org/2018/credentials/v1', 'https://www.w3.org/2018/credentials/examples/v1'],
  type: ['VerifiablePresentation'],
  verifiableCredential: [vc]
};
const expectedVp = {
  ...presentation,
  proof: {
    type: 'Ed25519Signature2018',
    proofPurpose: 'authentication',
    verificationMethod:
      'did:key:z6MkoB84PJkXzFpbqtfYV5WqBKHCSDf7A1SeepwzvE36QvCF#z6MkoB84PJkXzFpbqtfYV5WqBKHCSDf7A1SeepwzvE36QvCF',
    created: '2021-11-16T14:52:19.514Z',
    jws: 'eyJhbGciOiJFZERTQSIsImNyaXQiOlsiYjY0Il0sImI2NCI6ZmFsc2V9..KMsV1E7TfwgK_GksVjR9ikMwrjbJE6WTE1Iwp2sHFFKzrMIQ1HzOznrl-h5W9QJ3DBM9PjRGtPYp9j7pn9x1Ag'
  }
};

describe('CredentialsService', () => {
  let service: CredentialsService;
  let didService: DIDService;
  let keyService: KeyService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CredentialsService,
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
    service = module.get<CredentialsService>(CredentialsService);
  });

  afterEach(async () => {
    jest.resetAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it.each([[credential, vc]])(
    'credential %p can be issued to be a vc %p',
    async (credential: CredentialDto, expectedVc: VerifiableCredential) => {
      const verificationMethod = await keyToVerificationMethod('key', JSON.stringify(key));
      const issuanceOptions: IssueOptionsDto = {
        proofPurpose: ProofPurpose.assertionMethod,
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
      expect(vc['proof']['jws']).toBeDefined();
      /**
       * Delete jws from proof as it is not deterministic
       * TODO: confirm this from the Ed25519Signature2018 spec
       */
      delete vc.proof.jws;
      const expectedVcCopy = JSON.parse(JSON.stringify(expectedVc));
      delete expectedVcCopy.proof.jws;
      expect(vc).toEqual(expectedVcCopy);
    }
  );

  it('should prove a vp', async () => {
    const verificationMethod = await keyToVerificationMethod('key', JSON.stringify(key));
    const issuanceOptions: IssueOptionsDto = {
      proofPurpose: ProofPurpose.authentication,
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
    expect(vc['proof']['jws']).toBeDefined();
    /**
     * Delete jws from proof as it is not deterministic
     * TODO: confirm this from the Ed25519Signature2018 spec
     */
    delete vp.proof.jws;
    const expectedVpCopy = JSON.parse(JSON.stringify(expectedVp));
    delete expectedVpCopy.proof.jws;
    expect(vp).toEqual(expectedVpCopy);
  });

  it('should be able to verify a credential', async () => {
    const verifyOptions: VerifyOptionsDto = {};
    const result = await service.verifyCredential(vc, verifyOptions);
    const expectedResult = { checks: ['proof'], warnings: [], errors: [] };
    expect(result).toEqual(expectedResult);
  });

  it('should be able to verify a presentation', async () => {
    const verifyOptions: VerifyOptionsDto = {
      proofPurpose: ProofPurpose.authentication,
      verificationMethod:
        'did:key:z6MkoB84PJkXzFpbqtfYV5WqBKHCSDf7A1SeepwzvE36QvCF#z6MkoB84PJkXzFpbqtfYV5WqBKHCSDf7A1SeepwzvE36QvCF'
    };
    const result = await service.verifyPresentation(expectedVp, verifyOptions);
    const expectedResult = { checks: ['proof'], warnings: [], errors: [] };
    expect(result).toEqual(expectedResult);
  });

  it('should be able to generate DIDAuth', async () => {
    const verificationMethod = await keyToVerificationMethod('key', JSON.stringify(key));
    const challenge = '2679f7f3-d9ff-4a7e-945c-0f30fb0765bd';
    const issuanceOptions: IssueOptionsDto = {
      proofPurpose: ProofPurpose.authentication,
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
