/*
 * Copyright 2021 - 2023 Energy Web Foundation
 * SPDX-License-Identifier: Apache-2.0
 */

import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DIDKeyFactory } from '@energyweb/ssi-did';
import { TypeOrmSQLiteModule } from '../db-config';
import { KeyModule } from '../key/key.module';
import { KeyService } from '../key/key.service';
import { DIDService } from './did.service';
import { DIDDocumentEntity } from './entities/did-document.entity';
import { VerificationMethodEntity } from './entities/verification-method.entity';
import { CredoModule } from '../credo/credo.module';
import { didDocument, generatedKey, publicKeyJwk, keyPair } from '../../test/did/did.service.spec.data';
import { CredoService } from '../credo/credo.service';
import { mockCredoService, resetMockKms } from '../credo/__mocks__/credo.service';

describe('DIDService', () => {
  let service: DIDService;
  let keyService: KeyService;

  beforeEach(async () => {
    resetMockKms();
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        KeyModule,
        CredoModule,
        TypeOrmSQLiteModule(true),
        TypeOrmModule.forFeature([DIDDocumentEntity, VerificationMethodEntity])
      ],
      providers: [
        DIDService,
        {
          provide: CredoService,
          useValue: mockCredoService
        }
      ]
    }).compile();

    keyService = module.get<KeyService>(KeyService);
    service = module.get<DIDService>(DIDService);

    jest.spyOn(keyService, 'generateKey').mockResolvedValue(generatedKey);
    jest.spyOn(keyService, 'getPublicKeyFromKeyId').mockResolvedValue(publicKeyJwk);
    jest.spyOn(DIDKeyFactory, 'generate').mockResolvedValue(didDocument);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('generate', () => {
    // it('should generate an did:ethr DID', async () => {
    //   const did = await service.generateEthrDID();
    //   expect(did.id).toBeDefined();
    //   expect(did.verificationMethod?.length).toEqual(1);
    // });

    it('should generate a did:key DID', async () => {
      const did = await service.generateKeyDID();
      expect(did.id).toBeDefined();
      expect(did.verificationMethod?.length).toEqual(1);
      expect(DIDKeyFactory.generate).toHaveBeenCalled();
    });
  });

  describe('register', () => {
    it('should register a did:key DID from an existing key pair', async () => {
      const existingKey = await keyService.importKey(keyPair);
      const did = await service.registerKeyDID(existingKey.keyId);
      expect(did.id).toBeDefined();
      expect(did.verificationMethod?.length).toEqual(1);
      expect(DIDKeyFactory.generate).toHaveBeenCalled();
    });
  });
});
