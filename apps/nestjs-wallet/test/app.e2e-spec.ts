import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { DIDDocument } from 'did-resolver';
import { CredentialDto } from '../src/vc-api/dtos/credential.dto';
import { IssueOptionsDto } from '../src/vc-api/dtos/issue-options.dto';
import { WorkflowResponseDto } from '../src/vc-api/workflow/dtos/workflow-response.dto';
import { WorkflowDefinitionDto } from '../src/vc-api/workflow/dtos/workflow-definition.dto';
import { VpRequestQueryType } from '../src/vc-api/workflow/types/vp-request-query-type';
import { VpRequestInteractServiceType } from '../src/vc-api/workflow/types/vp-request-interact-service-type';

// Increasing timeout for debugging
// Should only affect this file https://jestjs.io/docs/jest-object#jestsettimeouttimeout
jest.setTimeout(300 * 1000);

describe('App (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule]
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe()); // https://github.com/nestjs/nest/issues/5264
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

  describe('Credential Issuance', () => {
    it('should get credential starting from an offer', async () => {
      // POST /workflows/configure
      const workflowName = 'permanent-resident-card-issuance';
      const workflowDefinition: WorkflowDefinitionDto = {
        workflowName: 'permanent-resident-card-issuance',
        query: [
          {
            type: VpRequestQueryType.didAuth,
            credentialQuery: []
          }
        ],
        interactServices: [
          {
            type: VpRequestInteractServiceType.unmediatedPresentation,
            baseUrl: '/elia-workflow'
          }
        ]
      };
      await request(app.getHttpServer())
        .post(`/vc-api/workflows/configure`)
        .send(workflowDefinition)
        .expect(201);

      // POST /workflows/{name}/start
      const startWorkflowResponse = await request(app.getHttpServer())
        .post(`/elia-workflow/workflows/${workflowName}/start`)
        .expect(201);
      const vpRequest = (startWorkflowResponse.body as WorkflowResponseDto).vpRequest;
      expect(vpRequest).toBeDefined();
      const challenge = vpRequest.challenge;
      expect(challenge).toBeDefined();
      expect(vpRequest.query).toHaveLength(1);
      expect(vpRequest.query[0].type).toEqual('DIDAuth');
      const workflowContinuationEndpoint = vpRequest.interact.service[0].serviceEndpoint;
      expect(workflowContinuationEndpoint).toContain('/elia-workflow/workflows/');

      // Create new DID and presentation to authentication as this DID
      // DID auth presentation: https://github.com/spruceid/didkit/blob/c5c422f2469c2c5cc2f6e6d8746e95b552fce3ed/lib/web/src/lib.rs#L382
      const requesterDID = await createDID('key');
      const options: IssueOptionsDto = {
        verificationMethod: requesterDID.verificationMethod[0].id,
        proofPurpose: 'authentication',
        challenge
      };
      const didAuthResponse = await request(app.getHttpServer())
        .post('/vc-api/presentations/prove/authentication')
        .send({ did: requesterDID.id, options })
        .expect(201);
      expect(didAuthResponse.body).toBeDefined();

      // Continue workflow and get VC
      const continueWorkflowResponse = await request(app.getHttpServer())
        .post(workflowContinuationEndpoint)
        .send(didAuthResponse.body)
        .expect(201);
      expect(continueWorkflowResponse.body.vc).toBeDefined();
    });
  });
});
