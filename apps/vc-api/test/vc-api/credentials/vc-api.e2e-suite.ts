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
