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

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule]
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();
  });

  describe('/converter/input-descriptor-to-credential (POST)', function () {
    describe('when called with a valid payload', function () {
      let result: request.Response;
      beforeEach(async function () {
        result = await request(app.getHttpServer())
          .post('/converter/input-descriptor-to-credential')
          .send({
            constraints: {
              fields: [
                { path: '$.@context', filter: {} },
                { path: '$.credentialSubject', filter: {} },
                { path: '$.type', filter: {} }
              ]
            }
          });
      });

      it('should respond with 201 status code', async function () {
        expect(result.status).toBe(201);
      });

      it('should respond with application/json Content-Type header', async function () {
        expect(result.headers['content-type']).toMatch('application/json');
      });

      it('should respond with body containing data', async function () {
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

    describe('when called with invalid payload', function () {
      let result: request.Response;

      beforeEach(async function () {
        result = await request(app.getHttpServer())
          .post('/converter/input-descriptor-to-credential')
          .send({ constraints: { fields: [{ path: '$.foobar', filter: {} }] } });
      });

      it('should respond with 400 status code', async function () {
        expect(result.status).toBe(400);
      });

      it('should respond with application/json Content-Type header', async function () {
        expect(result.headers['content-type']).toMatch('application/json');
      });

      it('should respond with a body containing data', async function () {
        expect(result.body).toBeDefined();
        expect(result.body).toEqual({
          error: 'Bad Request',
          message: [
            'constraints.fields.0.path property key name value must be one of the allowed string values: @context,credentialSubject,id,issuanceDate,type',
            'constraints.fields needs to be an array of objects with at least the following path field values: $.@context, $.credentialSubject, $.type'
          ],
          statusCode: 400
        });
      });
    });
  });
});
