import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as axios from 'axios';
import * as request from 'supertest';
import * as nock from 'nock';
import { v4 as uuidv4 } from 'uuid';
import { WalletClient } from './wallet-client';
import { AppModule } from '../src/app.module';
import { CredentialDto } from '../src/vc-api/credentials/dtos/credential.dto';
import { IssueOptionsDto } from '../src/vc-api/credentials/dtos/issue-options.dto';
import { ExchangeDefinitionDto } from '../src/vc-api/exchanges/dtos/exchange-definition.dto';
import { VpRequestQueryType } from '../src/vc-api/exchanges/types/vp-request-query-type';
import { VpRequestInteractServiceType } from '../src/vc-api/exchanges/types/vp-request-interact-service-type';
import { ResidenceCardIssuance } from './sample-business-logic/resident-card-issuance.exchange';
import { VpRequestDto } from 'src/vc-api/exchanges/dtos/vp-request.dto';
import { ProofPurpose } from '@sphereon/pex';

// Increasing timeout for debugging
// Should only affect this file https://jestjs.io/docs/jest-object#jestsettimeouttimeout
jest.setTimeout(300 * 1000);

// If you are using jsdom, axios will default to using the XHR adapter which
// can't be intercepted by nock. So, configure axios to use the node adapter.
//
// References:
// https://github.com/nock/nock/issues/699#issuecomment-272708264
// https://github.com/axios/axios/issues/305
axios.default.defaults.adapter = require('axios/lib/adapters/http');

describe('App (e2e)', () => {
  let app: INestApplication;
  let walletClient: WalletClient;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule]
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe()); // https://github.com/nestjs/nest/issues/5264
    await app.init();
    walletClient = new WalletClient(app);
  });

  describe('DID', () => {
    it('should create and retrieve a new did:ethr DID', async () => {
      await walletClient.createDID('ethr');
    });

    it('should create and retrieve a new did:key DID', async () => {
      await walletClient.createDID('key');
    });
  });

  describe('VcApi', () => {
    it('should issue using a generated did:key', async () => {
      const didDoc = await walletClient.createDID('key');
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
      const exchange = new ResidenceCardIssuance();
      await request(app.getHttpServer())
        .post(`${vcApiBaseUrl}/exchanges`)
        .send(exchange.getExchangeDefinition())
        .expect(201);

      // Start issuance exchange
      // POST /exchanges/{exchangeId}
      const issuanceExchangeEndpoint = `${vcApiBaseUrl}/exchanges/${exchange.exchangeId}`;
      const issuanceVpRequest = await walletClient.startExchange(
        issuanceExchangeEndpoint,
        exchange.queryType
      );
      const issuanceExchangeContinuationEndpoint = getContinuationEndpoint(issuanceVpRequest);
      expect(issuanceExchangeContinuationEndpoint).toContain(issuanceExchangeEndpoint);

      // Create new DID and presentation to authentication as this DID
      // DID auth presentation: https://github.com/spruceid/didkit/blob/c5c422f2469c2c5cc2f6e6d8746e95b552fce3ed/lib/web/src/lib.rs#L382
      const holderDID = await walletClient.createDID('key');
      const holderVerificationMethod = holderDID.verificationMethod[0].id;
      const options: IssueOptionsDto = {
        verificationMethod: holderVerificationMethod,
        proofPurpose: ProofPurpose.authentication,
        challenge: issuanceVpRequest.challenge
      };
      const didAuthResponse = await request(app.getHttpServer())
        .post(`${vcApiBaseUrl}/presentations/prove/authentication`)
        .send({ did: holderDID.id, options })
        .expect(201);
      const didAuthVp = didAuthResponse.body;
      expect(didAuthVp).toBeDefined();

      // Continue exchange by submitting presention
      await walletClient.continueExchange(issuanceExchangeContinuationEndpoint, didAuthVp, true);

      // TODO: have the issuer get the review and approve. For now, just issue directly
      const issueResult = await exchange.issueCredential(didAuthVp, walletClient);
      const issuedVc = issueResult.vp.verifiableCredential[0];
      expect(issuedVc).toBeDefined();

      // Configure presentation exchange
      // POST /exchanges
      const presentationExchangeId = `b229a18f-db45-4b33-8d36-25d442467bab`;
      const callbackUrlBase = 'http://government-app-backend';
      const callbackUrlPath = '/endpoint';
      const presentationQueryType = VpRequestQueryType.presentationDefinition;
      const presentationExchangeDefinition: ExchangeDefinitionDto = {
        exchangeId: presentationExchangeId,
        query: [
          {
            type: presentationQueryType,
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
        isOneTime: true,
        callback: [
          {
            url: callbackUrlBase + ':80' + callbackUrlPath
          }
        ]
      };
      const scope = nock(callbackUrlBase).post(callbackUrlPath).reply(201, { message: 'you did it!' });
      await request(app.getHttpServer())
        .post(`${vcApiBaseUrl}/exchanges`)
        .send(presentationExchangeDefinition)
        .expect(201);

      // Start presentation exchange
      // POST /exchanges/{exchangeId}
      const exchangeEndpoint = `${vcApiBaseUrl}/exchanges/${presentationExchangeId}`;
      const presentationVpRequest = await walletClient.startExchange(exchangeEndpoint, presentationQueryType);
      const presentationExchangeContinuationEndpoint = getContinuationEndpoint(presentationVpRequest);
      expect(presentationExchangeContinuationEndpoint).toContain(exchangeEndpoint);

      // Holder should parse VP Request for correct credentials...
      // Assume that holder figures out which VC they need and can prep presentation
      const presentation = {
        '@context': [
          'https://www.w3.org/2018/credentials/v1',
          'https://www.w3.org/2018/credentials/examples/v1'
        ],
        type: ['VerifiablePresentation'],
        verifiableCredential: [issuedVc]
      };
      const issuanceOptions: IssueOptionsDto = {
        proofPurpose: ProofPurpose.authentication,
        verificationMethod: holderVerificationMethod,
        created: '2021-11-16T14:52:19.514Z',
        challenge: presentationVpRequest.challenge
      };
      const vp = await walletClient.provePresentation({ presentation, options: issuanceOptions });

      // Holder submits presentation
      await walletClient.continueExchange(presentationExchangeContinuationEndpoint, vp, false);
      scope.done();
    });
  });
});

/**
 * https://stackoverflow.com/a/2599721 , because only need path for test
 * @param vpRequest
 * @returns exchange continuation endpoint
 */
function getContinuationEndpoint(vpRequest: VpRequestDto): string {
  const exchangeContinuationEndpoint = vpRequest.interact.service[0].serviceEndpoint.replace(
    /https?:\/\/[^\/]+/i,
    ''
  );
  return exchangeContinuationEndpoint;
}
