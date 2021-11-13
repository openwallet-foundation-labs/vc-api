import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { Methods } from '@ew-did-registry/did';

describe('App (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule]
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  describe('DID', () => {
    it('should create and retrieve a DID', async () => {
      const postResponse = await request(app.getHttpServer()).post('/did').expect(201);
      expect(postResponse.body).toHaveProperty('did');
      expect(postResponse.body).toHaveProperty('controllingKeyThumbprint');
      const newDID = postResponse.body.did;
      const method = newDID.split(':')[1];
      expect(method).toEqual(Methods.Erc1056);

      const getResponse = await request(app.getHttpServer()).get(`/did/${newDID}`).expect(200);
      expect(getResponse.body).toHaveProperty('controllingKeyThumbprint');
      expect(postResponse.body.controllingKeyThumbprint).toEqual(getResponse.body.controllingKeyThumbprint);
    });
  });
});
