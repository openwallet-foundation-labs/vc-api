import * as request from 'supertest';
import * as nock from 'nock';
import { IssueOptionsDto } from '../../../../src/vc-api/credentials/dtos/issue-options.dto';
import { ProofPurpose } from '@sphereon/pex';
import { RebeamCpoNode } from './rebeam-cpo-node';
import { app, getContinuationEndpoint, vcApiBaseUrl, walletClient } from '../../../app.e2e-spec';
import { RebeamSupplier } from './rebeam-supplier';

export const rebeamExchangeSuite = () => {
  it('Rebeam presentation using ed25119 signatures', async () => {
    const holderDID = await walletClient.createDID('key');
    const holderVerificationMethod = holderDID.verificationMethod[0].id;

    // SUPPLIER: Issue "rebeam-customer" credential
    const supplier = new RebeamSupplier();
    const issuanceVp = await supplier.issueCredential(holderDID, walletClient);

    // CPO-NODE: Configure presentation exchange
    const callbackUrlBase = 'http://example.com';
    const callbackUrlPath = '/endpoint';
    const presentationExchange = new RebeamCpoNode(`${callbackUrlBase}${callbackUrlPath}`);
    const scope = nock(callbackUrlBase).post(callbackUrlPath).reply(201);
    const exchangeDef = presentationExchange.getExchangeDefinition();
    await request(app.getHttpServer()).post(`${vcApiBaseUrl}/exchanges`).send(exchangeDef).expect(201);

    // HOLDER WALLET (Switchboard): Start presentation exchange and present credential
    const exchangeEndpoint = `${vcApiBaseUrl}/exchanges/${presentationExchange.getExchangeId()}`;
    const presentationVpRequest = await walletClient.startExchange(
      exchangeEndpoint,
      presentationExchange.queryType
    );
    const presentationExchangeContinuationEndpoint = getContinuationEndpoint(presentationVpRequest);
    expect(presentationExchangeContinuationEndpoint).toContain(exchangeEndpoint);

    const presentation = {
      '@context': [
        'https://www.w3.org/2018/credentials/v1',
        'https://www.w3.org/2018/credentials/examples/v1'
      ],
      type: ['VerifiablePresentation'],
      verifiableCredential: [issuanceVp.vp.verifiableCredential[0]],
      holder: holderDID.id
    };
    const issuanceOptions: IssueOptionsDto = {
      proofPurpose: ProofPurpose.authentication,
      verificationMethod: holderVerificationMethod,
      challenge: presentationVpRequest.challenge
    };
    const vp = await walletClient.provePresentation({ presentation, options: issuanceOptions });

    // Holder submits presentation
    await walletClient.continueExchange(presentationExchangeContinuationEndpoint, vp, false);
    scope.done();
  });
};
