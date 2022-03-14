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
import { DIDService } from './did.service';
import { DIDDocumentEntity } from './entities/did-document.entity';
import { VerificationMethodEntity } from './entities/verification-method.entity';

describe('DIDService', () => {
  let service: DIDService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        KeyModule,
        TypeOrmSQLiteModule(),
        TypeOrmModule.forFeature([DIDDocumentEntity, VerificationMethodEntity])
      ],
      providers: [DIDService]
    }).compile();

    service = module.get<DIDService>(DIDService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create an ethr DID', async () => {
      const did = await service.generateEthrDID();
      expect(did.id).toBeDefined();
      expect(did.verificationMethod?.length).toEqual(1);
    });
  });
});
