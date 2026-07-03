import { IKeyDescription } from '@energyweb/w3c-ccg-webkms';
import { DIDDocument } from 'did-resolver';
import { JWK } from 'jose';
import { KeyPairDto } from '../../src/key/dtos/key-pair.dto';

export const generatedKey: IKeyDescription = {
  keyId: '6qZag5woSLKdVtKW37hBPNZGrJFzR4HiXvsADAZY1seC'
};
export const didDocument: DIDDocument = {
  context: [
    'https://w3id.org/did/v1',
    'https://w3id.org/security/suites/ed25519-2018/v1',
    'https://w3id.org/security/suites/x25519-2019/v1'
  ],
  id: 'did:key:z6MkkHpdGLCEmsp6cPACigf2EU7GfsXqpwY5Dwn63SXYw6Ra',
  verificationMethod: [
    {
      id: 'did:key:z6MkkHpdGLCEmsp6cPACigf2EU7GfsXqpwY5Dwn63SXYw6Ra#z6MkkHpdGLCEmsp6cPACigf2EU7GfsXqpwY5Dwn63SXYw6Ra',
      type: 'Ed25519VerificationKey2018',
      controller: 'did:key:z6MkkHpdGLCEmsp6cPACigf2EU7GfsXqpwY5Dwn63SXYw6Ra',
      publicKeyBase58: '6qZag5woSLKdVtKW37hBPNZGrJFzR4HiXvsADAZY1seC'
    }
  ],
  authentication: [
    'did:key:z6MkkHpdGLCEmsp6cPACigf2EU7GfsXqpwY5Dwn63SXYw6Ra#z6MkkHpdGLCEmsp6cPACigf2EU7GfsXqpwY5Dwn63SXYw6Ra'
  ],
  assertionMethod: [
    'did:key:z6MkkHpdGLCEmsp6cPACigf2EU7GfsXqpwY5Dwn63SXYw6Ra#z6MkkHpdGLCEmsp6cPACigf2EU7GfsXqpwY5Dwn63SXYw6Ra'
  ],
  keyAgreement: [
    {
      id: 'did:key:z6MkkHpdGLCEmsp6cPACigf2EU7GfsXqpwY5Dwn63SXYw6Ra#z6LSeq2Z3VnKx2mRpTV3b8szdfvTaBeAKBmm943gQYUuf2qe',
      type: 'X25519KeyAgreementKey2019',
      controller: 'did:key:z6MkkHpdGLCEmsp6cPACigf2EU7GfsXqpwY5Dwn63SXYw6Ra',
      publicKeyBase58: '49rPXByTra3gj57H4VN3K5hyj373cabcG5Kzv5qNwf4t'
    }
  ],
  capabilityInvocation: [
    'did:key:z6MkkHpdGLCEmsp6cPACigf2EU7GfsXqpwY5Dwn63SXYw6Ra#z6MkkHpdGLCEmsp6cPACigf2EU7GfsXqpwY5Dwn63SXYw6Ra'
  ],
  capabilityDelegation: [
    'did:key:z6MkkHpdGLCEmsp6cPACigf2EU7GfsXqpwY5Dwn63SXYw6Ra#z6MkkHpdGLCEmsp6cPACigf2EU7GfsXqpwY5Dwn63SXYw6Ra'
  ]
} as unknown as DIDDocument;

export const publicKeyJwk: JWK = {
  kty: 'OKP',
  crv: 'Ed25519',
  x: 'VrsnBw1-JP3R4xuaQqDQI9pXM2YP1Per79Unm2UkCaU',
  kid: '6qZag5woSLKdVtKW37hBPNZGrJFzR4HiXvsADAZY1seC'
};

export const keyPair: KeyPairDto = {
  publicKey: {
    kty: 'OKP',
    crv: 'Ed25519',
    x: 'VrsnBw1-JP3R4xuaQqDQI9pXM2YP1Per79Unm2UkCaU',
    kid: '6qZag5woSLKdVtKW37hBPNZGrJFzR4HiXvsADAZY1seC'
  },
  privateKey: {
    kty: 'OKP',
    crv: 'Ed25519',
    x: 'VrsnBw1-JP3R4xuaQqDQI9pXM2YP1Per79Unm2UkCaU',
    d: 'IGPeDFjy0q9WFK13SQlPDTMWpbc5TI0lgMqq03nJchw'
  }
};
