/*
 * Copyright 2021 - 2023 Energy Web Foundation
 * SPDX-License-Identifier: Apache-2.0
 */

import * as request from 'supertest';
import { CredentialDto } from '../../../src/vc-api/credentials/dtos/credential.dto';
import { IssueOptionsDto } from '../../../src/vc-api/credentials/dtos/issue-options.dto';
import { app, walletClient } from '../../app.e2e-spec';
import { API_DEFAULT_VERSION_PREFIX } from '../../../src/setup';

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
    const options: IssueOptionsDto = {};
    const postResponse = await request(app.getHttpServer())
      .post(`${API_DEFAULT_VERSION_PREFIX}/vc-api/credentials/issue`)
      .send({ credential, options })
      .expect(201);
    expect(postResponse.body).toBeDefined();
  });
};
