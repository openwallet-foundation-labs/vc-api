import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmSQLiteModule } from '../in-memory-db';
import { KeyModule } from '../key/key.module';
import { DIDService } from './did.service';

describe('DIDService', () => {
  let service: DIDService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [KeyModule, ...TypeOrmSQLiteModule()],
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
      expect(did.controllingKeyThumbprint).toBeDefined();
      expect(did.did).toBeDefined();
    });
  });
});
