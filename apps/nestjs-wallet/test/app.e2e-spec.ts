import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { v4 as uuidv4 } from 'uuid';
import { AppModule } from '../src/app.module';
import { DIDDocument } from 'did-resolver';
import { CredentialDto } from '../src/vc-api/dtos/credential.dto';
import { IssueOptionsDto } from '../src/vc-api/dtos/issue-options.dto';
import { ExchangeResponseDto } from '../src/vc-api/exchanges/dtos/exchange-response.dto';
import { ExchangeDefinitionDto } from '../src/vc-api/exchanges/dtos/exchange-definition.dto';
import { VpRequestQueryType } from '../src/vc-api/exchanges/types/vp-request-query-type';
import { VpRequestInteractServiceType } from '../src/vc-api/exchanges/types/vp-request-interact-service-type';

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

  describe('Credential Issuance and Presentation', () => {
    it('should get credential starting from an invitation and present this credential', async () => {
      const eliaExchangeBaseUrl = '/elia-exchange';
      const vcApiBaseUrl = '/vc-api';
      // Configure credential issuance exchange
      // POST /exchanges/configure
      const issuanceExchangeId = 'permanent-resident-card-issuance';
      const exchangeDefinition: ExchangeDefinitionDto = {
        exchangeId: issuanceExchangeId,
        query: [
          {
            type: VpRequestQueryType.didAuth,
            credentialQuery: []
          }
        ],
        interactServices: [
          {
            type: VpRequestInteractServiceType.unmediatedPresentation,
            baseUrl: eliaExchangeBaseUrl
          }
        ]
      };
      await request(app.getHttpServer())
        .post(`${vcApiBaseUrl}/exchanges/configure`)
        .send(exchangeDefinition)
        .expect(201);

      // POST /exchanges/{exchangeId}
      const startWorkflowResponse = await request(app.getHttpServer())
        .post(`${eliaExchangeBaseUrl}/exchanges/${issuanceExchangeId}`)
        .expect(201);
      const vpRequest = (startWorkflowResponse.body as ExchangeResponseDto).vpRequest;
      expect(vpRequest).toBeDefined();
      const challenge = vpRequest.challenge;
      expect(challenge).toBeDefined();
      expect(vpRequest.query).toHaveLength(1);
      expect(vpRequest.query[0].type).toEqual('DIDAuth');
      const workflowContinuationEndpoint = vpRequest.interact.service[0].serviceEndpoint;
      expect(workflowContinuationEndpoint).toContain(`${eliaExchangeBaseUrl}/exchanges/`);

      // Create new DID and presentation to authentication as this DID
      // DID auth presentation: https://github.com/spruceid/didkit/blob/c5c422f2469c2c5cc2f6e6d8746e95b552fce3ed/lib/web/src/lib.rs#L382
      const requesterDID = await createDID('key');
      const options: IssueOptionsDto = {
        verificationMethod: requesterDID.verificationMethod[0].id,
        proofPurpose: 'authentication',
        challenge
      };
      const didAuthResponse = await request(app.getHttpServer())
        .post(`${vcApiBaseUrl}/presentations/prove/authentication`)
        .send({ did: requesterDID.id, options })
        .expect(201);
      expect(didAuthResponse.body).toBeDefined();

      // Continue exchange and get VC
      // PUT /exchanges/{exchangeId}/{transactionId}
      const continueWorkflowResponse = await request(app.getHttpServer())
        .put(workflowContinuationEndpoint)
        .send(didAuthResponse.body)
        .expect(200);
      expect(continueWorkflowResponse.body.errors).toHaveLength(0);
      expect(continueWorkflowResponse.body.vc).toBeDefined();

      // Configure presentation exchange
      // POST /exchanges/configure
      const presentationExchangeId = 'permanent-resident-card-presentation';
      const presentationExchangeDefinition: ExchangeDefinitionDto = {
        exchangeId: presentationExchangeId,
        query: [
          {
            type: VpRequestQueryType.presentationDefinition,
            credentialQuery: [
              {
                id: uuidv4(),
                input_descriptors: [
                  {
                    id: 'permanent_resident_card',
                    name: 'Permanent Resident Card',
                    purpose: 'We can only allow permanent residents into the application'
                  }
                ]
              }
            ]
          }
        ],
        interactServices: [
          {
            type: VpRequestInteractServiceType.unmediatedPresentation,
            baseUrl: eliaExchangeBaseUrl
          }
        ]
      };
      await request(app.getHttpServer())
        .post(`${vcApiBaseUrl}/exchanges/configure`)
        .send(presentationExchangeDefinition)
        .expect(201);
    });
  });
});
