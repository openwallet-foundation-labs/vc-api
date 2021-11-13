import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { calculateJwkThumbprint, JWK } from 'jose';
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
    keyGenerationTest(service.generateEd25119);
  });

  describe('Secp256k1', () => {
    keyGenerationTest(service.generateSecp256k1);
  });

  function keyGenerationTest(generateKey: () => Promise<JWK>) {
    /**
     * From https://www.w3.org/TR/did-core/#verification-material :
     * "It is RECOMMENDED that JWK kid values are set to the public key fingerprint [RFC7638]."
     */
    it('kid of generated key should be thumbprint', async () => {
      const newPublicKey = await generateKey();
      const thumbprint = await calculateJwkThumbprint(newPublicKey, 'sha256');
      expect(newPublicKey.kid).toEqual(thumbprint);
    });

    it('should generate and retrieve a key', async () => {
      const newPublicKey = await generateKey();
      const storedPrivateKey = await service.retrievePrivateKey(newPublicKey.kid);
      expect(storedPrivateKey).toBeDefined();
      // TODO: check that returned key actually matches generated key
    });
  }
});
