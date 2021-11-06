import { Test, TestingModule } from '@nestjs/testing';
import { KeyModule } from '../key/key.module';
import { DidService } from './did.service';

describe('DidService', () => {
  let service: DidService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [KeyModule],
      providers: [DidService]
    }).compile();

    service = module.get<DidService>(DidService);
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
