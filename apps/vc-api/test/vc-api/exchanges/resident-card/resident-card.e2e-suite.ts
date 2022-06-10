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

import { ProofPurpose } from '@sphereon/pex';
import * as request from 'supertest';
import * as nock from 'nock';
import { IssueOptionsDto } from '../../../../src/vc-api/credentials/dtos/issue-options.dto';
import { PresentationDto } from '../../../../src/vc-api/credentials/dtos/presentation.dto';
import {
  ReviewResult,
  SubmissionReviewDto
} from '../../../../src/vc-api/exchanges/dtos/submission-review.dto';
import { ResidentCardIssuance } from './resident-card-issuance.exchange';
import { ResidentCardPresentation } from './resident-card-presentation.exchange';
import { app, getContinuationEndpoint, vcApiBaseUrl, walletClient } from '../../../app.e2e-spec';
import { ProvePresentationOptionsDto } from 'src/vc-api/credentials/dtos/prove-presentation-options.dto';

export const residentCardExchangeSuite = () => {
  it('should support Resident Card issuance and presentation', async () => {
    // As issuer, configure credential issuance exchange
    // POST /exchanges
    const exchange = new ResidentCardIssuance();
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
    await walletClient.continueExchange(issuanceExchangeContinuationEndpoint, didAuthVp, true, true);

    // As the issuer, get the transaction
    // TODO TODO TODO!!! How does the issuer know the transactionId? -> Maybe can rely on notification
    const urlComponents = issuanceExchangeContinuationEndpoint.split('/');
    const transactionId = urlComponents.pop();
    const transaction = await walletClient.getExchangeTransaction(exchange.getExchangeId(), transactionId);

    // As the issuer, check the result of the transaction verification
    expect(transaction.presentationSubmission.verificationResult.checks).toContain('proof');
    expect(transaction.presentationSubmission.verificationResult.errors).toHaveLength(0);

    // As the issuer, create a presentation to provide the credential to the holder
    const issueResult = await exchange.issueCredential(didAuthVp, walletClient);
    const issuedVP = issueResult.vp; // VP used to wrapped issued credentials
    const submissionReview: SubmissionReviewDto = {
      result: ReviewResult.approved,
      vp: issuedVP
    };
    await walletClient.addSubmissionReview(exchange.getExchangeId(), transactionId, submissionReview);

    // As the holder, check for a reviewed submission
    const secondContinuationResponse = await walletClient.continueExchange(
      issuanceExchangeContinuationEndpoint,
      didAuthVp,
      false
    );
    const issuedVc = secondContinuationResponse.vp.verifiableCredential[0];
    expect(issuedVc).toBeDefined();

    // Configure presentation exchange
    // POST /exchanges
    const callbackUrlBase = 'http://example.com';
    const callbackUrlPath = '/endpoint';
    const presentationExchange = new ResidentCardPresentation(`${callbackUrlBase}${callbackUrlPath}`);
    const scope = nock(callbackUrlBase).post(callbackUrlPath).reply(201, { message: 'you did it!' });
    const exchangeDef = presentationExchange.getExchangeDefinition();
    await request(app.getHttpServer()).post(`${vcApiBaseUrl}/exchanges`).send(exchangeDef).expect(201);

    // Start presentation exchange
    // POST /exchanges/{exchangeId}
    const exchangeEndpoint = `${vcApiBaseUrl}/exchanges/${presentationExchange.getExchangeId()}`;
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
    await walletClient.continueExchange(presentationExchangeContinuationEndpoint, vp, false);
    scope.done();
  });
};
