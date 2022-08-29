/*
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

import { AppModule as VcApiAppModule } from '@energyweb/ssi-vc-api';
import { AppModule as CidAppModule } from '@energyweb/input-descriptor-to-credential';
import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { CredentialDto } from '@energyweb/ssi-vc-api/dist/src/vc-api/credentials/dtos/credential.dto';
import { IssueOptionsDto } from '@energyweb/ssi-vc-api/dist/src/vc-api/credentials/dtos/issue-options.dto';

describe('E2E Suite', function () {
  let vcApiAppInstance: INestApplication;
  let cidAppInstance: INestApplication;

  beforeEach(async function () {
    vcApiAppInstance = (
      await Test.createTestingModule({
        imports: [VcApiAppModule]
      }).compile()
    ).createNestApplication();
    vcApiAppInstance.useGlobalPipes(new ValidationPipe());

    cidAppInstance = (
      await Test.createTestingModule({
        imports: [CidAppModule]
      }).compile()
    ).createNestApplication();
    cidAppInstance.useGlobalPipes(new ValidationPipe({ whitelist: true }));

    await Promise.all([vcApiAppInstance.init(), cidAppInstance.init()]);
  });

  afterEach(async function () {
    await Promise.all([vcApiAppInstance.close(), cidAppInstance.close()]);
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

    describe('INPUT-DESCRIPTOR-TO-CREDENTIAL', function () {
      const validPayload = {
        constraints: {
          fields: [
            { path: ['$.@context'], filter: {} },
            { path: ['$.credentialSubject'], filter: {} },
            { path: ['$.type'], filter: {} }
          ]
        }
      };

      it('should be defined', async function () {
        expect(cidAppInstance).toBeDefined();
      });

      it('should convert input descriptor to credentials', async function () {
        const result = await request(cidAppInstance.getHttpServer())
          .post('/converter/input-descriptor-to-credential')
          .send(validPayload)
          .expect(201);

        expect(result.body).toBeDefined();
        expect(result.body).toEqual({
          credential: {
            '@context': {},
            credentialSubject: {},
            type: {}
          }
        });
      });
    });
  });

  describe('When having valid Input Descriptor and DID', function () {
    let did;
    const validInputDescriptor = {
      constraints: {
        fields: [
          {
            path: ['$.id'],
            filter: {
              const: 'urn:uuid:49f69fb8-f256-4b2e-b15d-c7ebec3a507e'
            }
          },
          {
            path: ['$.@context'],
            filter: {
              $schema: 'http://json-schema.org/draft-07/schema#',
              type: 'array',
              items: [
                {
                  const: 'https://www.w3.org/2018/credentials/v1'
                },
                {
                  $ref: '#/definitions/eliaGroupContext'
                }
              ],
              additionalItems: false,
              minItems: 2,
              maxItems: 2,
              definitions: {
                eliaGroupContext: {
                  type: 'object',
                  properties: {
                    elia: {
                      const: 'https://www.eliagroup.eu/ld-context-2022#'
                    },
                    consent: {
                      const: 'elia:consent'
                    }
                  },
                  additionalProperties: false,
                  required: ['elia', 'consent']
                }
              }
            }
          },
          {
            path: ['$.credentialSubject'],
            filter: {
              type: 'object',
              properties: {
                id: { const: 'did:example:d23dd687a7dc6787646f2eb98d0' }
              },
              additionalProperties: false
            }
          },
          {
            path: ['$.type'],
            filter: {
              type: 'array',
              items: [{ const: 'VerifiableCredential' }]
            }
          }
        ]
      }
    };

    beforeEach(async function () {
      did = await getDid(vcApiAppInstance);
    });

    describe('after converting it to the credential to be signed', function () {
      let credential;

      beforeEach(async function () {
        credential = (
          await request(cidAppInstance.getHttpServer())
            .post('/converter/input-descriptor-to-credential')
            .send(validInputDescriptor)
            .expect(201)
        ).body.credential;
      });

      describe('VC-API when requested', function () {
        let result: request.Response;

        beforeEach(async function () {
          result = await request(vcApiAppInstance.getHttpServer())
            .post('/vc-api/credentials/issue')
            .send({
              credential: { ...credential, issuer: did.id, issuanceDate: '2020-08-19T21:41:50Z' },
              options: {}
            });
        });
        it('should accept it', async function () {
          expect(result.status).toBe(201);
        });

        describe('and response body', function () {
          let body;
          beforeEach(async function () {
            body = result.body;
          });

          it('should be defined', async function () {
            expect(body).toBeDefined();
          });

          it('should contain expected properties', async function () {
            expect(Object.keys(body)).toEqual([
              '@context',
              'id',
              'type',
              'credentialSubject',
              'issuer',
              'issuanceDate',
              'proof'
            ]);
          });

          it('should contain expected properties types', async function () {
            expect(body).toEqual(
              expect.objectContaining({
                '@context': expect.any(Object),
                type: expect.any(Array),
                credentialSubject: expect.any(Object),
                issuer: expect.any(String),
                issuanceDate: expect.any(String),
                proof: expect.any(Object)
              })
            );
          });

          describe('and proof response body property object', function () {
            let proof;

            beforeEach(async function () {
              proof = body.proof;
            });

            it('should be defined', async function () {
              expect(proof).toBeDefined();
            });

            it('should contain expected properties', async function () {
              expect(Object.keys(proof)).toEqual([
                'type',
                'proofPurpose',
                'verificationMethod',
                'created',
                'jws'
              ]);
            });

            it('should contain expected properties types', async function () {
              expect(proof).toEqual(
                expect.objectContaining({
                  type: expect.any(String),
                  proofPurpose: expect.any(String),
                  verificationMethod: expect.any(String),
                  created: expect.any(String),
                  jws: expect.any(String)
                })
              );
            });
          });
        });
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
