/*
 * Copyright 2021 - 2023 Energy Web Foundation
 * SPDX-License-Identifier: Apache-2.0
 */

import { AppModule as VcApiAppModule } from '@energyweb/ssi-vc-api';
import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { CredentialDto } from '@energyweb/ssi-vc-api/dist/src/vc-api/credentials/dtos/credential.dto';
import { IssueOptionsDto } from '@energyweb/ssi-vc-api/dist/src/vc-api/credentials/dtos/issue-options.dto';

describe('E2E Suite', function () {
  let vcApiAppInstance: INestApplication;

  beforeEach(async function () {
    vcApiAppInstance = (
      await Test.createTestingModule({
        imports: [VcApiAppModule]
      }).compile()
    ).createNestApplication();
    vcApiAppInstance.useGlobalPipes(new ValidationPipe());

    await vcApiAppInstance.init();
  });

  afterEach(async function () {
    await vcApiAppInstance.close();
  });

  describe('Smoke test', function () {
    describe('VC-API', function () {
      it('should be defined', async function () {
        expect(vcApiAppInstance).toBeDefined();
      });

      it('should generate a new did', async function () {
        const response: request.Response = await request(vcApiAppInstance.getHttpServer())
          .post('/did')
          .send({ method: 'key' });

        expect(response.status).toBe(201);
        expect(response.body).toHaveProperty('id');
        expect(response.body).toHaveProperty('verificationMethod');
        expect(response.body['verificationMethod']).toHaveLength(1);
      });

      it('should issue a new credentials', async function () {
        const didDoc = (await request(vcApiAppInstance.getHttpServer()).post('/did').send({ method: 'key' }))
          .body;

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

        const response: request.Response = await request(vcApiAppInstance.getHttpServer())
          .post('/vc-api/credentials/issue')
          .send({ credential, options });

        expect(response.status).toBe(201);
      });
    });
  });
});

async function getDid(app: INestApplication) {
  const response: request.Response = await request(app.getHttpServer()).post('/did').send({ method: 'key' });

  expect(response.status).toBe(201);
  expect(response.body).toHaveProperty('id');
  expect(response.body).toHaveProperty('verificationMethod');
  expect(response.body['verificationMethod']).toHaveLength(1);

  return response.body;
}
