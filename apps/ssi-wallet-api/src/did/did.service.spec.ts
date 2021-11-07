import { EthrDID } from '@energyweb/ssi-did';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { KeyModule } from '../key/key.module';
import { DIDService } from './did.service';

const repositoryMockFactory = jest.fn(() => ({
  save: jest.fn(entity => entity),
}));

describe('DIDService', () => {
  let service: DIDService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [KeyModule],
      providers: [
        DIDService,
        {
          provide: getRepositoryToken(EthrDID),
          useFactory: repositoryMockFactory,
        },
      ]
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
