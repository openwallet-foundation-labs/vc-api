/**
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
import { TypeOrmModule } from '@nestjs/typeorm';
import { TypeOrmSQLiteModule } from '../in-memory-db';
import { KeyModule } from '../key/key.module';
import { KeyService } from '../key/key.service';
import { DIDService } from './did.service';
import { DIDDocumentEntity } from './entities/did-document.entity';
import { VerificationMethodEntity } from './entities/verification-method.entity';

describe('DIDService', () => {
  let service: DIDService;
  let keyService: KeyService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        KeyModule,
        TypeOrmSQLiteModule(),
        TypeOrmModule.forFeature([DIDDocumentEntity, VerificationMethodEntity])
      ],
      providers: [DIDService]
    }).compile();

    keyService = module.get<KeyService>(KeyService);
    service = module.get<DIDService>(DIDService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('generate', () => {
    it('should generate an did:ethr DID', async () => {
      const did = await service.generateEthrDID();
      expect(did.id).toBeDefined();
      expect(did.verificationMethod?.length).toEqual(1);
    });

    it('should generate a did:key DID', async () => {
      const did = await service.generateKeyDID();
      expect(did.id).toBeDefined();
      expect(did.verificationMethod?.length).toEqual(1);
    });
  });

  describe('register', () => {
    it('should register a did:key DID from an existing key pair', async () => {
      const existingKeyDescription = {
        keyId: 'xtYQnNso7KLvSySJ3_MlaTmc2AEjLvlBb6o7u8OQ6hQ'
      };
      const key = {
        crv: 'Ed25519',
        x: 'ahpPa82qzgSJUGP53pbdbq3BrtLLehQEJ4ZVINGEhAg',
        kty: 'OKP',
        kid: 'xtYQnNso7KLvSySJ3_MlaTmc2AEjLvlBb6o7u8OQ6hQ'
      };
      jest.spyOn(keyService, 'getPublicKeyFromKeyId').mockImplementation(() => Promise.resolve(key));
      const did = await service.registerKeyDID(existingKeyDescription.keyId);
      expect(did.id).toBeDefined();
      expect(did.verificationMethod?.length).toEqual(1);
    });
  });
});
