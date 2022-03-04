import { INestApplication } from '@nestjs/common';
import { DIDDocument } from 'did-resolver';
import * as request from 'supertest';
import { VerifiableCredentialDto } from '../src/vc-api/dtos/verifiable-credential.dto';
import { IssueCredentialDto } from '../src/vc-api/dtos/issue-credential.dto';
import { ProvePresentationDto } from '../src/vc-api/dtos/prove-presentation.dto';
import { VerifiablePresentationDto } from '../src/vc-api/dtos/verifiable-presentation.dto';
import { VpRequestDto } from '../src/vc-api/exchanges/dtos/vp-request.dto';
import { ExchangeResponseDto } from '../src/vc-api/exchanges/dtos/exchange-response.dto';

/**
 * A wallet client for e2e tests
 */
export class WalletClient {
  #app: INestApplication;

  constructor(app: INestApplication) {
    this.#app = app;
  }

  async createDID(requestedMethod: string): Promise<DIDDocument> {
    const postResponse = await request(this.#app.getHttpServer())
      .post('/did')
      .send({ method: requestedMethod })
      .expect(201);
    expect(postResponse.body).toHaveProperty('id');
    expect(postResponse.body).toHaveProperty('verificationMethod');
    expect(postResponse.body['verificationMethod']).toHaveLength(1);
    const newDID = postResponse.body.id;
    const createdMethod = newDID.split(':')[1];
    expect(createdMethod).toEqual(requestedMethod);

    const getResponse = await request(this.#app.getHttpServer())
      .get(`/did/${newDID}`)
      .expect(200);
    expect(getResponse.body).toHaveProperty('verificationMethod');
    expect(postResponse.body['verificationMethod']).toMatchObject(getResponse.body['verificationMethod']);
    return postResponse.body;
  }

  async issueVC(issueCredentialDto: IssueCredentialDto): Promise<VerifiableCredentialDto> {
    const postResponse = await request(this.#app.getHttpServer())
      .post('/vc-api/credentials/issue')
      .send(issueCredentialDto)
      .expect(201);
    return postResponse.body;
  }

  async provePresentation(provePresentationDto: ProvePresentationDto): Promise<VerifiablePresentationDto> {
    const postResponse = await request(this.#app.getHttpServer())
      .post('/vc-api/presentations/prove')
      .send(provePresentationDto)
      .expect(201);
    return postResponse.body;
  }

  async startExchange(exchangeEndpoint: string): Promise<VpRequestDto> {
    const startWorkflowResponse = await request(this.#app.getHttpServer())
      .post(exchangeEndpoint)
      .expect(201);
    const vpRequest = (startWorkflowResponse.body as ExchangeResponseDto).vpRequest;
    expect(vpRequest).toBeDefined();
    const challenge = vpRequest.challenge;
    expect(challenge).toBeDefined();
    expect(vpRequest.query).toHaveLength(1);
    expect(vpRequest.query[0].type).toEqual('DIDAuth');
    return vpRequest;
  }

  /**
   * PUT /exchanges/{exchangeId}/{transactionId}
   * @param exchangeContinuationEndpoint
   * @param vp
   */
  async continueExchange(exchangeContinuationEndpoint: string, vp: VerifiablePresentationDto) {
    const continueExchangeResponse = await request(this.#app.getHttpServer())
      .put(exchangeContinuationEndpoint)
      .send(vp)
      .expect(200);
    expect(continueExchangeResponse.body.errors).toHaveLength(0);
    expect(continueExchangeResponse.body.vpRequest).toBeDefined();
  }
}
