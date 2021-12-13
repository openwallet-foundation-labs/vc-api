import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { DIDDocument } from 'did-resolver';
import { CredentialDto } from '../src/vc-api/dto/credential.dto';
import { IssueOptionsDto } from '../src/vc-api/dto/issue-options.dto';
import { CredentialOfferDto } from '../src/elia-issuer/dtos/credential-offer.dto';
import { WorkflowRequestResponse } from 'src/elia-issuer/types/workflow-request-response';

describe('App (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule]
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  describe('DID', () => {
    it('should create and retrieve a new did:ethr DID', async () => {
      await createDID('ethr');
    });

    it('should create and retrieve a new did:key DID', async () => {
      await createDID('key');
    });
  });

  describe('VcApi', () => {
    it('should issue using a generated did:key', async () => {
      const didDoc = await createDID('key');
      const credential: CredentialDto = {
        '@context': ['https://www.w3.org/2018/credentials/v1'],
        id: 'http://example.org/credentials/3731',
        type: ['VerifiableCredential'],
        issuer: didDoc.id,
        issuanceDate: '2020-08-19T21:41:50Z',
        credentialSubject: {
          id: 'did:example:d23dd687a7dc6787646f2eb98d0'
        }
      };
      const options: IssueOptionsDto = {
        verificationMethod: didDoc.verificationMethod[0].id
      };
      const postResponse = await request(app.getHttpServer())
        .post('/vc-api/credentials/issue')
        .send({ credential, options })
        .expect(201);
      expect(postResponse.body).toBeDefined();
    });
  });

  async function createDID(requestedMethod: string): Promise<DIDDocument> {
    const postResponse = await request(app.getHttpServer())
      .post('/did')
      .send({ method: requestedMethod })
      .expect(201);
    expect(postResponse.body).toHaveProperty('id');
    expect(postResponse.body).toHaveProperty('verificationMethod');
    expect(postResponse.body['verificationMethod']).toHaveLength(1);
    const newDID = postResponse.body.id;
    const createdMethod = newDID.split(':')[1];
    expect(createdMethod).toEqual(requestedMethod);

    const getResponse = await request(app.getHttpServer()).get(`/did/${newDID}`).expect(200);
    expect(getResponse.body).toHaveProperty('verificationMethod');
    expect(postResponse.body['verificationMethod']).toMatchObject(getResponse.body['verificationMethod']);
    return postResponse.body;
  }

  describe('Elia Issuer', () => {
    it('should get credential starting from an offer', async () => {
      // GET credential offer
      const credOfferResponse = await request(app.getHttpServer())
        .get('/elia-issuer/credential-offer')
        .expect(200);
      expect(credOfferResponse).toBeDefined();
      const credOffer = credOfferResponse.body as CredentialOfferDto;
      const expectedWorkflow = '/elia-issuer/start-workflow/permanent-resident-card';
      expect(credOffer.vcRequestUrl.endsWith(expectedWorkflow)).toBeTruthy();
      const expectedCredentialType = 'PermanentResidentCard';
      expect(credOffer.typeAvailable).toEqual(expectedCredentialType);

      // POST start-workflow
      const workflowResponse = await request(app.getHttpServer()).post(expectedWorkflow).expect(201);
      const vpReqest = (workflowResponse.body as WorkflowRequestResponse).vpRequest;
      expect(vpReqest).toBeDefined();
      expect(vpReqest.challenge).toBeDefined();
      expect(vpReqest.query).toHaveLength(1);
      expect(vpReqest.query[0].type).toEqual('DIDAuth');

      // Parse VP Request
      // 1. Find DID auth query
      // 2. Generate DID auth presentation https://github.com/spruceid/didkit/blob/c5c422f2469c2c5cc2f6e6d8746e95b552fce3ed/lib/web/src/lib.rs#L382
      const didDoc = await createDID('key');
      const options: IssueOptionsDto = {
        verificationMethod: didDoc.verificationMethod[0].id,
        proofPurpose: 'authentication'
      };
      const postResponse = await request(app.getHttpServer())
        .post('/vc-api/presentations/prove/authentication')
        .send({ did: didDoc.id, options })
        .expect(201);
      expect(postResponse.body).toBeDefined();

      // Continue workflow and get VC
    });
  });
});
