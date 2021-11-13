import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { calculateJwkThumbprint } from 'jose';
import { TypeOrmSQLiteModule } from '../in-memory-db';
import { KeyPair } from './key-pair.entity';
import { KeyService } from './key.service';

describe('KeyService', () => {
  let service: KeyService;

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
    const result = await service.retrievePrivateKey('thumbprint-of-not-available-key');
    expect(result).toBeUndefined();
  });

  describe('Ed25519', () => {
    /**
     * From https://www.w3.org/TR/did-core/#verification-material :
     * "It is RECOMMENDED that JWK kid values are set to the public key fingerprint [RFC7638]."
     */
    it('kid of generated Ed25519 key should be thumbprint', async () => {
      const newKey = await service.generateEd25119();
      const thumbprint = await calculateJwkThumbprint(newKey, 'sha256');
      expect(newKey.kid).toEqual(thumbprint);
    });

    it('should generate and retrieve a Ed25519 key', async () => {
      const newKey = await service.generateEd25119();
      expect(newKey).toBeDefined();
      const storedPrivateKey = await service.retrievePrivateKey(newKey.kid);
      expect(storedPrivateKey).toBeDefined();
      // TODO: check that returned key actually matches generated key
    });
  });

  describe('Secp256k1', () => {
    /**
     * From https://www.w3.org/TR/did-core/#verification-material :
     * "It is RECOMMENDED that JWK kid values are set to the public key fingerprint [RFC7638]."
     */
    it('kid of generated Secp256k1 key should be thumbprint', async () => {
      const newKey = await service.generateSecp256k1();
      const thumbprint = await calculateJwkThumbprint(newKey, 'sha256');
      expect(newKey.kid).toEqual(thumbprint);
    });

    it('should generate and retrieve a Secp256k1 key', async () => {
      const newKey = await service.generateSecp256k1();
      expect(newKey).toBeDefined();
      const storedPrivateKey = await service.retrievePrivateKey(newKey.kid);
      expect(storedPrivateKey).toBeDefined();
      // TODO: check that returned key actually matches generated key
    });
  });
});
