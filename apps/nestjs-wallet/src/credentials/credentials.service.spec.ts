import { Test, TestingModule } from '@nestjs/testing';
import { generateEd25519Key, issueCredential, keyToDID, keyToVerificationMethod } from '@spruceid/didkit-wasm-node';
import { CredentialsService } from './credentials.service';

describe('CredentialsService', () => {
  let service: CredentialsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CredentialsService],
    }).compile();

    service = module.get<CredentialsService>(CredentialsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should be able to issue a credential', async () => {
    const key = generateEd25519Key();
    const did = keyToDID('key', key);
    const verificationMethod = await keyToVerificationMethod('key', key);
    const credential = JSON.stringify({
      "@context": "https://www.w3.org/2018/credentials/v1",
      "id": "http://example.org/credentials/3731",
      "type": ["VerifiableCredential"],
      "issuer": did,
      "issuanceDate": "2020-08-19T21:41:50Z",
      "credentialSubject": {
        "id": "did:example:d23dd687a7dc6787646f2eb98d0"
      }
    });
    const proofOptions = JSON.stringify({
      "proofPurpose": "assertionMethod",
      "verificationMethod": verificationMethod
    });
    const vc = await issueCredential(credential, proofOptions, key);
    expect(vc).toBeDefined();
  });
});
