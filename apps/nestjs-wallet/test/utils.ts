import { INestApplication } from '@nestjs/common';
import { DIDDocument } from 'did-resolver';
import * as request from 'supertest';
import { VerifiableCredentialDto } from '../src/vc-api/dtos/verifiable-credential.dto';
import { IssueCredentialDto } from '../src/vc-api/dtos/issue-credential.dto';
import { ProvePresentationDto } from 'src/vc-api/dtos/prove-presentation.dto';
import { VerifiablePresentationDto } from 'src/vc-api/dtos/verifiable-presentation.dto';

export async function createDID(requestedMethod: string, app: INestApplication): Promise<DIDDocument> {
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

export async function issueVC(
  issueCredentialDto: IssueCredentialDto,
  app: INestApplication
): Promise<VerifiableCredentialDto> {
  const postResponse = await request(app.getHttpServer())
    .post('/vc-api/credentials/issue')
    .send(issueCredentialDto)
    .expect(201);
  return postResponse.body;
}

export async function provePresentation(
  provePresentationDto: ProvePresentationDto,
  app: INestApplication
): Promise<VerifiablePresentationDto> {
  const postResponse = await request(app.getHttpServer())
    .post('/vc-api/presentations/prove')
    .send(provePresentationDto)
    .expect(201);
  return postResponse.body;
}
