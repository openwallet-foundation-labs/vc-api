/**
 * Copyright 2021 - 2023 Energy Web Foundation
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
import { calculateJwkThumbprint, JWK } from 'jose';
import { TypeOrmSQLiteModule } from '../in-memory-db';
import { KeyPair } from './key-pair.entity';
import { keyType } from './key-types';
import { KeyService } from './key.service';

describe('KeyService', () => {
  let service: KeyService;
  let newPublicKey: JWK;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [TypeOrmSQLiteModule(), TypeOrmModule.forFeature([KeyPair])],
      providers: [KeyService]
    }).compile();

    service = module.get<KeyService>(KeyService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return undefined if asked for privateKey that it does not have', async () => {
    const result = await service.getPublicKeyFromKeyId('thumbprint-of-not-available-key');
    expect(result).toBeUndefined();
  });

  describe('Ed25519', () => {
    beforeEach(async () => {
      const keyDescription = await service.generateKey({ type: keyType.ed25519 });
      newPublicKey = await service.getPublicKeyFromKeyId(keyDescription.keyId);
    });
    keyGenerationTest();
  });

  describe('Secp256k1', () => {
    beforeEach(async () => {
      const keyDescription = await service.generateKey({ type: keyType.secp256k1 });
      newPublicKey = await service.getPublicKeyFromKeyId(keyDescription.keyId);
    });
    keyGenerationTest();
  });

  function keyGenerationTest() {
    /**
     * From https://www.w3.org/TR/did-core/#verification-material :
     * "It is RECOMMENDED that JWK kid values are set to the public key fingerprint [RFC7638]."
     */
    it('kid of generated key should be thumbprint', async () => {
      const thumbprint = await calculateJwkThumbprint(newPublicKey, 'sha256');
      expect(newPublicKey.kid).toEqual(thumbprint);
    });

    it('should generate and retrieve a key', async () => {
      const storedPrivateKey = await service.getPublicKeyFromKeyId(newPublicKey.kid);
      expect(storedPrivateKey).toBeDefined();
      // TODO: check that returned key actually matches generated key
    });
  }
});
