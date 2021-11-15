import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { DIDDocument } from 'did-resolver';
import { CredentialDto } from '../src/credentials/dto/credential.dto';
import { IssueCredentialOptionsDto } from '../src/credentials/dto/issue-credential-options.dto';

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
    it('should create and retrieve a new did:ethr DID', async () => {
      await createDID('ethr');
    });

    it('should create and retrieve a new did:key DID', async () => {
      await createDID('key');
    });
  });

  describe('Credentials', () => {
    it('should issue using a generated did:key', async () => {
      const didDoc = await createDID('key');
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
      const options: IssueCredentialOptionsDto = {
        verificationMethod: didDoc.verificationMethod[0].id
      };
      const postResponse = await request(app.getHttpServer())
        .post('/credentials/issue')
        .send({ credential, options })
        .expect(201);
      expect(postResponse.body).toBeDefined();
    });
  });

  async function createDID(requestedMethod: string): Promise<DIDDocument> {
    const postResponse = await request(app.getHttpServer())
      .post('/did')
      .send({ method: requestedMethod })
      .expect(201);
    expect(postResponse.body).toHaveProperty('id');
    expect(postResponse.body).toHaveProperty('verificationMethod');
    expect(postResponse.body['verificationMethod']).toHaveLength(1);
    const newDID = postResponse.body.id;
    const createdMethod = newDID.split(':')[1];
    expect(createdMethod).toEqual(requestedMethod);

    const getResponse = await request(app.getHttpServer()).get(`/did/${newDID}`).expect(200);
    expect(getResponse.body).toHaveProperty('verificationMethod');
    expect(postResponse.body['verificationMethod']).toMatchObject(getResponse.body['verificationMethod']);
    return postResponse.body;
  }
});
