import * as request from 'supertest';
import { CredentialDto } from '../../../src/vc-api/credentials/dtos/credential.dto';
import { IssueOptionsDto } from '../../../src/vc-api/credentials/dtos/issue-options.dto';
import { app, walletClient } from '../../app.e2e-spec';

export const vcApiSuite = () => {
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
};
