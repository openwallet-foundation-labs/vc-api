import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

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
    it('should create and retrieve an ethr DID', async () => {
      const postResponse = await request(app.getHttpServer())
        .post('/did')
        .send({ method: 'ethr' })
        .expect(201);
      expect(postResponse.body).toHaveProperty('id');
      expect(postResponse.body).toHaveProperty('verificationMethod');
      expect(postResponse.body['verificationMethod']).toHaveLength(1);
      const newDID = postResponse.body.id;
      const method = newDID.split(':')[1];
      expect(method).toEqual('ethr');

      const getResponse = await request(app.getHttpServer()).get(`/did/${newDID}`).expect(200);
      expect(getResponse.body).toHaveProperty('verificationMethod');
      expect(postResponse.body['verificationMethod']).toMatchObject(getResponse.body['verificationMethod']);
    });

    it('should create and retrieve an key DID', async () => {
      const postResponse = await request(app.getHttpServer())
        .post('/did')
        .send({ method: 'key' })
        .expect(201);
      expect(postResponse.body).toHaveProperty('id');
      expect(postResponse.body).toHaveProperty('verificationMethod');
      expect(postResponse.body['verificationMethod']).toHaveLength(1);
      const newDID = postResponse.body.id;
      const method = newDID.split(':')[1];
      expect(method).toEqual('key');

      const getResponse = await request(app.getHttpServer()).get(`/did/${newDID}`).expect(200);
      expect(getResponse.body).toHaveProperty('verificationMethod');
      expect(postResponse.body['verificationMethod']).toMatchObject(getResponse.body['verificationMethod']);
    });
  });
});
