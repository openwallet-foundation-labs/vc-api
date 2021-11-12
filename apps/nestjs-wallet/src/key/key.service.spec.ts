import { Test, TestingModule } from '@nestjs/testing';
import { KeyService } from './key.service';

describe('KeyService', () => {
  let service: KeyService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [KeyService]
    }).compile();

    service = module.get<KeyService>(KeyService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should generate an Ed25519Key', async () => {
    const key = await service.generateEd25119();
    expect(key).toBeDefined();
  });
});
