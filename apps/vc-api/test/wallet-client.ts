/**
 * Copyright 2021, 2022 Energy Web Foundation
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

import { INestApplication } from '@nestjs/common';
import { DIDDocument } from 'did-resolver';
import * as request from 'supertest';
import { VerifiableCredentialDto } from '../src/vc-api/credentials/dtos/verifiable-credential.dto';
import { IssueCredentialDto } from '../src/vc-api/credentials/dtos/issue-credential.dto';
import { ProvePresentationDto } from '../src/vc-api/credentials/dtos/prove-presentation.dto';
import { VerifiablePresentationDto } from '../src/vc-api/credentials/dtos/verifiable-presentation.dto';
import { VpRequestDto } from '../src/vc-api/exchanges/dtos/vp-request.dto';
import { ExchangeResponseDto } from '../src/vc-api/exchanges/dtos/exchange-response.dto';
import { VpRequestQueryType } from '../src/vc-api/exchanges/types/vp-request-query-type';
import { TransactionDto } from '../src/vc-api/exchanges/dtos/transaction.dto';
import { SubmissionReviewDto } from '../src/vc-api/exchanges/dtos/submission-review.dto';
import { IPresentationDefinition } from '@sphereon/pex';
import { PresentationDto } from '../src/vc-api/credentials/dtos/presentation.dto';
import { KeyPairDto } from '../src/key/dtos/key-pair.dto';
import { KeyDescriptionDto } from 'src/key/dtos/key-description.dto';
import { API_DEFAULT_VERSION_PREFIX } from '../src/setup';

/**
 * A wallet client for e2e tests
 */
export class WalletClient {
  #app: INestApplication;

  constructor(app: INestApplication) {
    this.#app = app;
  }

  async exportKey(keyId: string): Promise<KeyPairDto> {
    const getResponse = await request(this.#app.getHttpServer())
      .get(`${API_DEFAULT_VERSION_PREFIX}/key/${keyId}`)
      .expect(200);
    expect(getResponse.body).toHaveProperty('privateKey');
    expect(getResponse.body).toHaveProperty('publicKey');
    return getResponse.body;
  }

  async importKey(keyPair: KeyPairDto): Promise<KeyDescriptionDto> {
    const postResponse = await request(this.#app.getHttpServer())
      .post(`${API_DEFAULT_VERSION_PREFIX}/key`)
      .send(keyPair)
      .expect(201);
    expect(postResponse.body).toHaveProperty('keyId');
    return postResponse.body;
  }

  async createDID(requestedMethod: string, keyId?: string): Promise<DIDDocument> {
    const postResponse = await request(this.#app.getHttpServer())
      .post(`${API_DEFAULT_VERSION_PREFIX}/did`)
      .send({ method: requestedMethod, keyId })
      .expect(201);
    expect(postResponse.body).toHaveProperty('id');
    expect(postResponse.body).toHaveProperty('verificationMethod');
    expect(postResponse.body['verificationMethod']).toHaveLength(1);
    const newDID = postResponse.body.id;
    const createdMethod = newDID.split(':')[1];
    expect(createdMethod).toEqual(requestedMethod);

    const getResponse = await request(this.#app.getHttpServer())
      .get(`${API_DEFAULT_VERSION_PREFIX}/did/${newDID}`)
      .expect(200);
    expect(getResponse.body).toHaveProperty('verificationMethod');
    expect(postResponse.body['verificationMethod']).toMatchObject(getResponse.body['verificationMethod']);
    return postResponse.body;
  }

  async issueVC(issueCredentialDto: IssueCredentialDto): Promise<VerifiableCredentialDto> {
    const postResponse = await request(this.#app.getHttpServer())
      .post(`${API_DEFAULT_VERSION_PREFIX}/vc-api/credentials/issue`)
      .send(issueCredentialDto)
      .expect(201);
    return postResponse.body;
  }

  async presentationFrom(
    presentationDefinition: IPresentationDefinition,
    credentials: VerifiableCredentialDto[]
  ): Promise<PresentationDto> {
    const postResponse = await request(this.#app.getHttpServer())
      .post(`${API_DEFAULT_VERSION_PREFIX}/vc-api/presentations/from`)
      .send({ presentationDefinition, credentials })
      .expect(201);
    return postResponse.body;
  }

  async provePresentation(provePresentationDto: ProvePresentationDto): Promise<VerifiablePresentationDto> {
    const postResponse = await request(this.#app.getHttpServer())
      .post(`${API_DEFAULT_VERSION_PREFIX}/vc-api/presentations/prove`)
      .send(provePresentationDto)
      .expect(201);
    return postResponse.body;
  }

  async startExchange(
    exchangeEndpoint: string,
    expectedQueryType: VpRequestQueryType
  ): Promise<VpRequestDto> {
    const startWorkflowResponse = await request(this.#app.getHttpServer())
      .post(exchangeEndpoint)
      .expect(201);
    const vpRequest = (startWorkflowResponse.body as ExchangeResponseDto).vpRequest;
    expect(vpRequest).toBeDefined();
    const challenge = vpRequest.challenge;
    expect(challenge).toBeDefined();
    expect(vpRequest.query).toHaveLength(1);
    expect(vpRequest.query[0].type).toEqual(expectedQueryType);
    return vpRequest;
  }

  /**
   * PUT /exchanges/{exchangeId}/{transactionId}
   * @param exchangeContinuationEndpoint
   * @param vp
   */
  async continueExchange(
    exchangeContinuationEndpoint: string,
    vp: VerifiablePresentationDto,
    expectsVpRequest: boolean,
    expectsProcessionInProgress = false
  ) {
    const continueExchangeResponse = await request(this.#app.getHttpServer())
      .put(exchangeContinuationEndpoint)
      .send(vp)
      .expect(expectsProcessionInProgress ? 202 : 200);
    expect(continueExchangeResponse.body.errors).toHaveLength(0);
    if (expectsVpRequest) {
      expect(continueExchangeResponse.body.vpRequest).toBeDefined();
    } else {
      expect(continueExchangeResponse.body.vpRequest).toBeUndefined();
    }
    return continueExchangeResponse.body as ExchangeResponseDto;
  }

  /**
   * GET /exchanges/{exchangeId}/{transactionId}
   */
  async getExchangeTransaction(exchangeId: string, transactionId: string) {
    const continueExchangeResponse = await request(this.#app.getHttpServer())
      .get(`${API_DEFAULT_VERSION_PREFIX}/vc-api/exchanges/${exchangeId}/${transactionId}`)
      .expect(200);

    return continueExchangeResponse.body as TransactionDto;
  }

  /**
   * POST /exchanges/{exchangeId}/{transactionId}/review
   */
  async addSubmissionReview(
    exchangeId: string,
    transactionId: string,
    submissionReviewDto: SubmissionReviewDto
  ) {
    const continueExchangeResponse = await request(this.#app.getHttpServer())
      .post(`${API_DEFAULT_VERSION_PREFIX}/vc-api/exchanges/${exchangeId}/${transactionId}/review`)
      .send(submissionReviewDto)
      .expect(201);
    return continueExchangeResponse?.body;
  }
}
