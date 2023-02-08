/**
 * Copyright 2021 - 2023 Energy Web Foundation
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

import { ProofPurpose } from '@sphereon/pex';
import * as request from 'supertest';
import * as nock from 'nock';
import { PresentationDto } from '../../../../src/vc-api/credentials/dtos/presentation.dto';
import {
  ReviewResult,
  SubmissionReviewDto
} from '../../../../src/vc-api/exchanges/dtos/submission-review.dto';
import { ConsentandResidentCardCredentialIssuance } from './consent-and-resident-card-credential-exchange';
import { ConsentAndResidentCardPresentation } from './consent-and-resident-card-presentation.exchange';
import { app, getContinuationEndpoint, vcApiBaseUrl, walletClient } from '../../../app.e2e-spec';
import { ProvePresentationOptionsDto } from 'src/vc-api/credentials/dtos/prove-presentation-options.dto';
import { error } from 'console';
import { Presentation } from 'src/vc-api/exchanges/types/presentation';

const callbackUrlBase = 'http://example.com';
const callbackUrlPath = '/endpoint';
const callbackUrl = `${callbackUrlBase}${callbackUrlPath}`;

export const consentAndResidentCardExchangeSuite = () => {
  it('should be able to verify VP with Consent and ResidentCard credential, where PD has multiple submission_requirement and input_desciptor groups', async () => {
    // As issuer, configure credential issuance exchange
    // POST /exchanges
    const exchange = new ConsentandResidentCardCredentialIssuance(callbackUrl);
    const numHolderQueriesPriorToIssuance = 2;
    const issuanceCallbackScope = nock(callbackUrlBase)
      .post(callbackUrlPath)
      .times(numHolderQueriesPriorToIssuance)
      .reply(201);
    await request(app.getHttpServer())
      .post(`${vcApiBaseUrl}/exchanges`)
      .send(exchange.getExchangeDefinition())
      .expect(201);

    // As holder, start issuance exchange
    // POST /exchanges/{exchangeId}
    const issuanceExchangeEndpoint = `${vcApiBaseUrl}/exchanges/${exchange.getExchangeId()}`;
    const issuanceVpRequest = await walletClient.startExchange(issuanceExchangeEndpoint, exchange.queryType);
    const issuanceExchangeContinuationEndpoint = getContinuationEndpoint(issuanceVpRequest);
    expect(issuanceExchangeContinuationEndpoint).toContain(issuanceExchangeEndpoint);

    // As holder, create new DID and presentation to authentication as this DID
    // DID auth presentation: https://github.com/spruceid/didkit/blob/c5c422f2469c2c5cc2f6e6d8746e95b552fce3ed/lib/web/src/lib.rs#L382
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

    // As holder, continue exchange by submitting did auth presention
    for (let i = 0; i < numHolderQueriesPriorToIssuance; i++) {
      await walletClient.continueExchange(issuanceExchangeContinuationEndpoint, didAuthVp, true, true);
    }
    issuanceCallbackScope.done();

    // As the issuer, get the transaction
    // TODO TODO TODO!!! How does the issuer know the transactionId? -> Maybe can rely on notification
    const urlComponents = issuanceExchangeContinuationEndpoint.split('/');
    const transactionId = urlComponents.pop();
    const transaction = await walletClient.getExchangeTransaction(exchange.getExchangeId(), transactionId);

    // As the issuer, check the result of the transaction verification
    expect(transaction.presentationSubmission.verificationResult.checks).toContain('proof');
    expect(transaction.presentationSubmission.verificationResult.errors).toHaveLength(0);

    // As the issuer, create a presentation to provide the credential to the holder
    const holderKeyId = holderDIDDoc.verificationMethod[0].publicKeyJwk.kid;
    const issueResultConsentCredential = await exchange.issueConsentCredential(holderKeyId, walletClient);
    const issuedVPConsentCredential = issueResultConsentCredential.vp;
    const issueResultResidentiCard = await exchange.issueResidentCardCredential(didAuthVp, walletClient);
    const issuedVPResidentCard = issueResultResidentiCard.vp; // VP used to wrapped issued credentials

    const finalPresentation: Presentation = {
      '@context': ['https://www.w3.org/2018/credentials/v1'],
      type: ['VerifiablePresentation'],
      verifiableCredential: [
        issuedVPConsentCredential.verifiableCredential[0],
        issuedVPResidentCard.verifiableCredential[0]
      ]
    };
    const presentationOptionsF: ProvePresentationOptionsDto = {
      verificationMethod: holderVerificationMethod
    };
    const provePresentationDto = {
      options: presentationOptionsF,
      presentation: finalPresentation
    };
    const returnVp = await walletClient.provePresentation(provePresentationDto);

    const submissionReviewResidentCard: SubmissionReviewDto = {
      result: ReviewResult.approved,
      vp: returnVp
    };
    await walletClient.addSubmissionReview(
      exchange.getExchangeId(),
      transactionId,
      submissionReviewResidentCard
    );
    // const submissionReview: SubmissionReviewDto = {
    //   result: ReviewResult.approved,
    //   vp: issuedVPConsentCredential
    // };
    // await walletClient.addSubmissionReview(exchange.getExchangeId(), transactionId, submissionReview);

    // As the holder, check for a reviewed submission
    const secondContinuationResponse = await walletClient.continueExchange(
      issuanceExchangeContinuationEndpoint,
      didAuthVp,
      false
    );
    const issuedVc1 = secondContinuationResponse.vp.verifiableCredential[0];
    const issuedVc2 = secondContinuationResponse.vp.verifiableCredential[1];
    expect(issuedVc1).toBeDefined();
    expect(issuedVc2).toBeDefined();

    // Configure presentation exchange
    // POST /exchanges
    const presentationExchange = new ConsentAndResidentCardPresentation(callbackUrl);
    const presentationCallbackScope = nock(callbackUrlBase).post(callbackUrlPath).reply(201);
    const exchangeDef = presentationExchange.getExchangeDefinitionV1();
    await request(app.getHttpServer()).post(`${vcApiBaseUrl}/exchanges`).send(exchangeDef).expect(201);

    // Start presentation exchange
    // POST /exchanges/{exchangeId}
    const exchangeEndpoint = `${vcApiBaseUrl}/exchanges/${presentationExchange.getExchangeIdV1()}`;
    const presentationVpRequest = await walletClient.startExchange(
      exchangeEndpoint,
      presentationExchange.queryType
    );
    const presentationExchangeContinuationEndpoint = getContinuationEndpoint(presentationVpRequest);
    expect(presentationExchangeContinuationEndpoint).toContain(exchangeEndpoint);

    // Holder should parse VP Request for correct credentials...
    // Assume that holder figures out which VC they need and can prep presentation
    const presentation: PresentationDto = {
      '@context': [
        'https://www.w3.org/2018/credentials/v1',
        'https://www.w3.org/2018/credentials/examples/v1'
      ],
      type: ['VerifiablePresentation'],
      verifiableCredential: [issuedVc1, issuedVc2],
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
    await walletClient.continueExchange(presentationExchangeContinuationEndpoint, vp, false);
    presentationCallbackScope.done();
  });

  it('should be able to verify VP with Consent and ResidentCard credential, where PD has one submission_requirement and input_desciptor group', async () => {
    // As issuer, configure credential issuance exchange
    // POST /exchanges
    const exchange = new ConsentandResidentCardCredentialIssuance(callbackUrl);
    const numHolderQueriesPriorToIssuance = 2;
    const issuanceCallbackScope = nock(callbackUrlBase)
      .post(callbackUrlPath)
      .times(numHolderQueriesPriorToIssuance)
      .reply(201);
    await request(app.getHttpServer())
      .post(`${vcApiBaseUrl}/exchanges`)
      .send(exchange.getExchangeDefinition())
      .expect(201);

    // As holder, start issuance exchange
    // POST /exchanges/{exchangeId}
    const issuanceExchangeEndpoint = `${vcApiBaseUrl}/exchanges/${exchange.getExchangeId()}`;
    const issuanceVpRequest = await walletClient.startExchange(issuanceExchangeEndpoint, exchange.queryType);
    const issuanceExchangeContinuationEndpoint = getContinuationEndpoint(issuanceVpRequest);
    expect(issuanceExchangeContinuationEndpoint).toContain(issuanceExchangeEndpoint);

    // As holder, create new DID and presentation to authentication as this DID
    // DID auth presentation: https://github.com/spruceid/didkit/blob/c5c422f2469c2c5cc2f6e6d8746e95b552fce3ed/lib/web/src/lib.rs#L382
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

    // As holder, continue exchange by submitting did auth presention
    for (let i = 0; i < numHolderQueriesPriorToIssuance; i++) {
      await walletClient.continueExchange(issuanceExchangeContinuationEndpoint, didAuthVp, true, true);
    }
    issuanceCallbackScope.done();

    // As the issuer, get the transaction
    // TODO TODO TODO!!! How does the issuer know the transactionId? -> Maybe can rely on notification
    const urlComponents = issuanceExchangeContinuationEndpoint.split('/');
    const transactionId = urlComponents.pop();
    const transaction = await walletClient.getExchangeTransaction(exchange.getExchangeId(), transactionId);

    // As the issuer, check the result of the transaction verification
    expect(transaction.presentationSubmission.verificationResult.checks).toContain('proof');
    expect(transaction.presentationSubmission.verificationResult.errors).toHaveLength(0);

    // As the issuer, create a presentation to provide the credential to the holder
    const holderKeyId = holderDIDDoc.verificationMethod[0].publicKeyJwk.kid;
    const issueResultConsentCredential = await exchange.issueConsentCredential(holderKeyId, walletClient);
    const issuedVPConsentCredential = issueResultConsentCredential.vp;
    const issueResultResidentiCard = await exchange.issueResidentCardCredential(didAuthVp, walletClient);
    const issuedVPResidentCard = issueResultResidentiCard.vp; // VP used to wrapped issued credentials

    const finalPresentation: Presentation = {
      '@context': ['https://www.w3.org/2018/credentials/v1'],
      type: ['VerifiablePresentation'],
      verifiableCredential: [
        issuedVPConsentCredential.verifiableCredential[0],
        issuedVPResidentCard.verifiableCredential[0]
      ]
    };
    const presentationOptionsF: ProvePresentationOptionsDto = {
      verificationMethod: holderVerificationMethod
    };
    const provePresentationDto = {
      options: presentationOptionsF,
      presentation: finalPresentation
    };
    const returnVp = await walletClient.provePresentation(provePresentationDto);

    const submissionReviewResidentCard: SubmissionReviewDto = {
      result: ReviewResult.approved,
      vp: returnVp
    };
    await walletClient.addSubmissionReview(
      exchange.getExchangeId(),
      transactionId,
      submissionReviewResidentCard
    );

    // As the holder, check for a reviewed submission
    const secondContinuationResponse = await walletClient.continueExchange(
      issuanceExchangeContinuationEndpoint,
      didAuthVp,
      false
    );
    const issuedVc1 = secondContinuationResponse.vp.verifiableCredential[0];
    const issuedVc2 = secondContinuationResponse.vp.verifiableCredential[1];
    expect(issuedVc1).toBeDefined();
    expect(issuedVc2).toBeDefined();

    // Configure presentation exchange
    // POST /exchanges
    const presentationExchange = new ConsentAndResidentCardPresentation(callbackUrl);
    const presentationCallbackScope = nock(callbackUrlBase).post(callbackUrlPath).reply(201);
    const exchangeDef = presentationExchange.getExchangeDefinitionV2();
    await request(app.getHttpServer()).post(`${vcApiBaseUrl}/exchanges`).send(exchangeDef).expect(201);

    // Start presentation exchange
    // POST /exchanges/{exchangeId}
    const exchangeEndpoint = `${vcApiBaseUrl}/exchanges/${presentationExchange.getExchangeIdV2()}`;
    const presentationVpRequest = await walletClient.startExchange(
      exchangeEndpoint,
      presentationExchange.queryType
    );
    const presentationExchangeContinuationEndpoint = getContinuationEndpoint(presentationVpRequest);
    expect(presentationExchangeContinuationEndpoint).toContain(exchangeEndpoint);

    // Holder should parse VP Request for correct credentials...
    // Assume that holder figures out which VC they need and can prep presentation
    const presentation: PresentationDto = {
      '@context': [
        'https://www.w3.org/2018/credentials/v1',
        'https://www.w3.org/2018/credentials/examples/v1'
      ],
      type: ['VerifiablePresentation'],
      verifiableCredential: [issuedVc1, issuedVc2],
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
    await walletClient.continueExchange(presentationExchangeContinuationEndpoint, vp, false);
    presentationCallbackScope.done();
  });
};
