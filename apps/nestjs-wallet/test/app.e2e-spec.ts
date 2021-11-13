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
      // {
      //   id: "did:ethr:volta:0xB1f55a748f0aE7712BEd0Bab29b8Cd190b3E8283",
      //   verificationMethod: [
      //     {
      //       id: "did:ethr:volta:0xB1f55a748f0aE7712BEd0Bab29b8Cd190b3E8283#controller",
      //       type: "EcdsaSecp256k1RecoveryMethod2020",
      //       controller: "did:ethr:volta:0xB1f55a748f0aE7712BEd0Bab29b8Cd190b3E8283",
      //       blockchainAccountId: "0xB1f55a748f0aE7712BEd0Bab29b8Cd190b3E8283@eip155:73799",
      //     },
      //   ],
      // }
      expect(postResponse.body).toHaveProperty('id');
      expect(postResponse.body).toHaveProperty('verificationMethod');
      expect(postResponse.body['verificationMethod']).toHaveLength(1);
      const newDID = postResponse.body.id;
      const method = newDID.split(':')[1];
      expect(method).toEqual(Methods.Erc1056);

      const getResponse = await request(app.getHttpServer()).get(`/did/${newDID}`).expect(200);
      expect(getResponse.body).toHaveProperty('verificationMethod');
      expect(postResponse.body['verificationMethod']).toMatchObject(getResponse.body['verificationMethod']);
    });
  });
});
