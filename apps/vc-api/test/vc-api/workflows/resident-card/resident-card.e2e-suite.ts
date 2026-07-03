/*
 * Copyright 2021 - 2023 Energy Web Foundation
 * SPDX-License-Identifier: Apache-2.0
 */

import { IProofPurpose as ProofPurpose } from '@sphereon/ssi-types';
import * as request from 'supertest';
import * as nock from 'nock';
import { PresentationDto } from '../../../../src/vc-api/credentials/dtos/presentation.dto';
import {
  ReviewResult,
  SubmissionReviewDto
} from '../../../../src/vc-api/exchanges/dtos/submission-review.dto';
import { ResidentCardIssuance } from './resident-card-issuance.workflow';
import { ResidentCardPresentation } from './resident-card-presentation.workflow';
import { app, getContinuationEndpoint, getUrlPath, vcApiBaseUrl, walletClient } from '../../../app.e2e-spec';
import { ProvePresentationOptionsDto } from '../../../../src/vc-api/credentials/dtos/prove-presentation-options.dto';
import { QueryExchangeStep } from '../../../../src/vc-api/workflows/types/query-exchange-step';
import { plainToInstance } from 'class-transformer';

const callbackUrlBase = 'http://example.com';
const callbackUrlPath = '/endpoint';
const callbackUrl = `${callbackUrlBase}${callbackUrlPath}`;

export const residentCardWorkflowSuite = () => {
  it('should support Resident Card issuance and presentation', async () => {
    // As issuer, configure credential issuance workflow
    // POST /workflows
    const issuanceWorkflow = new ResidentCardIssuance(callbackUrl);
    const numHolderQueriesPriorToIssuance = 2;
    const issuanceCallbackScope = nock(callbackUrlBase)
      .post(callbackUrlPath)
      .times(numHolderQueriesPriorToIssuance)
      .reply(201);
    await request(app.getHttpServer())
      .post(`${vcApiBaseUrl}/workflows`)
      .send(issuanceWorkflow.getWorkflowDefinition())
      .expect(201);

    // As issuer, create credential issuance exchange
    // POST /workflows/{localWorkflowId}/exchanges
    const createExchangeResponse = await request(app.getHttpServer())
      .post(`${vcApiBaseUrl}/workflows/${issuanceWorkflow.getWorkflowId()}/exchanges/`)
      .send()
      .expect(201);
    const exchangeId = createExchangeResponse.body.exchangeId;

    // As holder, start issuance exchange
    // POST /workflows/{localWorkflowId}/exchanges/{localExchangeId}
    const issuanceExchangeEndpoint = getUrlPath(exchangeId);
    const issuanceVpRequest = await walletClient.startWorkflowExchange(
      issuanceExchangeEndpoint,
      issuanceWorkflow.queryType
    );
    const issuanceExchangeContinuationEndpoint = getContinuationEndpoint(issuanceVpRequest);
    expect(issuanceExchangeContinuationEndpoint).toContain(issuanceExchangeEndpoint);

    // As holder, create new DID and presentation to authentication as this DID
    const holderDIDDoc = await walletClient.createDID('key');
    const holderVerificationMethod = holderDIDDoc.verificationMethod[0].id;
    const options: ProvePresentationOptionsDto = {
      verificationMethod: holderVerificationMethod,
      proofPurpose: ProofPurpose.authentication,
      challenge: issuanceVpRequest.challenge
    };
    const didAuthResponse = await request(app.getHttpServer())
      .post(`${vcApiBaseUrl}/presentations/prove/authentication`)
      .send({ did: holderDIDDoc.id, options })
      .expect(201);
    const didAuthVp = didAuthResponse.body;
    expect(didAuthVp).toBeDefined();

    // As holder, continue exchange by submitting did auth presentation
    for (let i = 0; i < numHolderQueriesPriorToIssuance; i++) {
      await walletClient.continueWorkflowExchange(
        issuanceExchangeContinuationEndpoint,
        didAuthVp,
        'redirectUrl',
        false
      );
    }
    await waitForScope(issuanceCallbackScope);

    // As the issuer, get the step submission
    const urlComponents = issuanceExchangeContinuationEndpoint.split('/');
    const localExchangeId = urlComponents.pop();
    const exchangeState = await walletClient.getExchangeState(
      issuanceWorkflow.getWorkflowId(),
      localExchangeId
    );
    const issuanceStepId = exchangeState.step;
    const didAuthStepId = issuanceWorkflow.getWorkflowDefinition().config.initialStep;
    const stepSubmission = await walletClient.getExchangeStepSubmission(
      issuanceWorkflow.getWorkflowId(),
      localExchangeId,
      didAuthStepId
    );

    // As the issuer, check the result of the step verification
    expect(stepSubmission.step.type).toEqual('QueryExchangeStep');
    const queryExchangeStep = plainToInstance(QueryExchangeStep, stepSubmission.step);
    expect(queryExchangeStep.isComplete).toBeTruthy();
    expect(queryExchangeStep.presentationSubmission.verificationResult.errors).toHaveLength(0);
    expect(queryExchangeStep.presentationSubmission.verificationResult.verified).toBeTruthy();

    // As the issuer, create a presentation to provide the credential to the holder
    const issueResult = await issuanceWorkflow.issueCredential(didAuthVp, walletClient);
    const issuedVP = issueResult.vp; // VP used to wrapped issued credentials
    const submissionReview: SubmissionReviewDto = {
      result: ReviewResult.approved,
      vp: issuedVP
    };
    await walletClient.addStepSubmissionReview(
      issuanceWorkflow.getWorkflowId(),
      localExchangeId,
      issuanceStepId,
      submissionReview
    );

    // As the holder, check for a reviewed submission
    const secondContinuationResponse = await walletClient.continueWorkflowExchange(
      issuanceExchangeContinuationEndpoint,
      didAuthVp,
      'verifiablePresentation'
    );
    const issuedVc = secondContinuationResponse.verifiablePresentation.verifiableCredential[0];
    expect(issuedVc).toBeDefined();

    // As verifier, configure presentation workflow
    // POST /workflows
    const presentationWorkflow = new ResidentCardPresentation(callbackUrl);
    const presentationCallbackScope = nock(callbackUrlBase).post(callbackUrlPath).reply(201);
    const workflowDef = presentationWorkflow.getWorkflowDefinition();
    await request(app.getHttpServer()).post(`${vcApiBaseUrl}/workflows`).send(workflowDef).expect(201);

    // As verifier, create presentation exchange
    // POST /workflows/{localWorkflowId}/exchanges/
    const createPresentationExchangeResponse = await request(app.getHttpServer())
      .post(`${vcApiBaseUrl}/workflows/${presentationWorkflow.getWorkflowId()}/exchanges/`)
      .send()
      .expect(201);
    const presentationExchangeId = createPresentationExchangeResponse.body.exchangeId;

    // As holder, start issuance exchange
    // POST /workflows/{localWorkflowId}/exchanges/{localExchangeId}
    const presentationExchangeEndpoint = getUrlPath(presentationExchangeId);
    const presentationVpRequest = await walletClient.startWorkflowExchange(
      presentationExchangeEndpoint,
      presentationWorkflow.queryType
    );
    const presentationExchangeContinuationEndpoint = getContinuationEndpoint(presentationVpRequest);
    expect(presentationExchangeContinuationEndpoint).toContain(presentationExchangeEndpoint);

    // Holder should parse VP Request for correct credentials...
    // Assume that holder figures out which VC they need and can prep presentation
    const presentation: PresentationDto = {
      '@context': [
        'https://www.w3.org/2018/credentials/v1',
        'https://www.w3.org/2018/credentials/examples/v1'
      ],
      type: ['VerifiablePresentation'],
      verifiableCredential: [issuedVc],
      holder: holderDIDDoc.id
    };
    const presentationOptions: ProvePresentationOptionsDto = {
      verificationMethod: holderVerificationMethod,
      proofPurpose: ProofPurpose.authentication,
      created: '2021-11-16T14:52:19.514Z',
      challenge: presentationVpRequest.challenge
    };
    const vp = await walletClient.provePresentation({ presentation, options: presentationOptions });

    // Holder submits presentation
    await walletClient.continueWorkflowExchange(presentationExchangeContinuationEndpoint, vp, 'vpRequest');
    await waitForScope(presentationCallbackScope);
  });
};

/**
 * The server submits exchange callbacks without awaiting them, so give the
 * fire-and-forget request a moment to reach the nock interceptor before
 * asserting on the scope.
 */
async function waitForScope(scope: nock.Scope, timeoutMs = 5000): Promise<void> {
  const start = Date.now();
  while (!scope.isDone() && Date.now() - start < timeoutMs) {
    await new Promise((resolve) => setTimeout(resolve, 50));
  }
  scope.done();
}
