import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmSQLiteModule } from '../in-memory-db';
import { KeyService } from './key.service';

describe('KeyService', () => {
  let service: KeyService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [...TypeOrmSQLiteModule()],
      providers: [KeyService]
    }).compile();

    service = module.get<KeyService>(KeyService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should generate and retrieve a Ed25519Key', async () => {
    const keyGenResult = await service.generateEd25119();
    expect(keyGenResult).toBeDefined();
    const storedPrivateKey = await service.retrievePrivateKey(keyGenResult.publicKeyThumbprint);
    expect(storedPrivateKey).toBeDefined();
    // TODO: check that returned key actually matches generated key
  });

  it('should return undefined if asked for privateKey that it does not have', async () => {
    const result = await service.retrievePrivateKey("thumbprint-of-not-available-key");
    expect(result).toBeUndefined();
  });
});
