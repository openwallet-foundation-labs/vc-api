import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { v4 as uuidv4 } from 'uuid';
import { createDID } from './utils';
import { AppModule } from '../src/app.module';
import { CredentialDto } from '../src/vc-api/dtos/credential.dto';
import { IssueOptionsDto } from '../src/vc-api/dtos/issue-options.dto';
import { ExchangeResponseDto } from '../src/vc-api/exchanges/dtos/exchange-response.dto';
import { ExchangeDefinitionDto } from '../src/vc-api/exchanges/dtos/exchange-definition.dto';
import { VpRequestQueryType } from '../src/vc-api/exchanges/types/vp-request-query-type';
import { VpRequestInteractServiceType } from '../src/vc-api/exchanges/types/vp-request-interact-service-type';
import { issueCredential } from './sample-business-logic/resident-card-issuance.exchange';

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
      await createDID('ethr', app);
    });

    it('should create and retrieve a new did:key DID', async () => {
      await createDID('key', app);
    });
  });

  describe('VcApi', () => {
    it('should issue using a generated did:key', async () => {
      const didDoc = await createDID('key', app);
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

  describe('Credential Issuance and Presentation', () => {
    it('should get credential starting from an invitation and present this credential', async () => {
      const vcApiBaseUrl = '/vc-api';
      // Configure credential issuance exchange
      // POST /exchanges
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
            type: VpRequestInteractServiceType.mediatedPresentation
          }
        ],
        isOneTime: false
      };
      await request(app.getHttpServer())
        .post(`${vcApiBaseUrl}/exchanges`)
        .send(exchangeDefinition)
        .expect(201);

      // POST /exchanges/{exchangeId}
      const exchangeEndpoint = `${vcApiBaseUrl}/exchanges/${issuanceExchangeId}`;
      const startWorkflowResponse = await request(app.getHttpServer()).post(exchangeEndpoint).expect(201);
      const vpRequest = (startWorkflowResponse.body as ExchangeResponseDto).vpRequest;
      expect(vpRequest).toBeDefined();
      const challenge = vpRequest.challenge;
      expect(challenge).toBeDefined();
      expect(vpRequest.query).toHaveLength(1);
      expect(vpRequest.query[0].type).toEqual('DIDAuth');
      // https://stackoverflow.com/a/2599721 , because only need path for test
      const workflowContinuationEndpoint = vpRequest.interact.service[0].serviceEndpoint.replace(
        /https?:\/\/[^\/]+/i,
        ''
      );
      expect(workflowContinuationEndpoint).toContain(exchangeEndpoint);

      // Create new DID and presentation to authentication as this DID
      // DID auth presentation: https://github.com/spruceid/didkit/blob/c5c422f2469c2c5cc2f6e6d8746e95b552fce3ed/lib/web/src/lib.rs#L382
      const requesterDID = await createDID('key', app);
      const options: IssueOptionsDto = {
        verificationMethod: requesterDID.verificationMethod[0].id,
        proofPurpose: 'authentication',
        challenge
      };
      const didAuthResponse = await request(app.getHttpServer())
        .post(`${vcApiBaseUrl}/presentations/prove/authentication`)
        .send({ did: requesterDID.id, options })
        .expect(201);
      const didAuthVp = didAuthResponse.body;
      expect(didAuthVp).toBeDefined();

      // Continue exchange by submitting presention
      // PUT /exchanges/{exchangeId}/{transactionId}
      const continueExchangeResponse = await request(app.getHttpServer())
        .put(workflowContinuationEndpoint)
        .send(didAuthResponse.body)
        .expect(200);
      expect(continueExchangeResponse.body.errors).toHaveLength(0);
      expect(continueExchangeResponse.body.vpRequest).toBeDefined();

      // TODO: have the issuer get the review and approve. For now, just issue directly
      const issueResult = await issueCredential(didAuthVp, app);
      const issuedVc = issueResult.vp.verifiableCredential[0];
      expect(issuedVc).toBeDefined();

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
            type: VpRequestInteractServiceType.unmediatedPresentation
          }
        ],
        isOneTime: false
      };
      await request(app.getHttpServer())
        .post(`${vcApiBaseUrl}/exchanges`)
        .send(presentationExchangeDefinition)
        .expect(201);
    });
  });
});
