import { EthrDID } from '@energyweb/ssi-did';
import { Methods } from '@ew-did-registry/did';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { KeyModule } from '../key/key.module';
import { DIDController } from './did.controller';
import { DIDService } from './did.service';

const repositoryMockFactory = jest.fn(() => ({
  save: jest.fn(entity => entity),
}));

describe('DidController', () => {
  let controller: DIDController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [KeyModule],
      controllers: [DIDController],
      providers: [
        DIDService,
        {
          provide: getRepositoryToken(EthrDID),
          useFactory: repositoryMockFactory,
        },
      ]
    }).compile();

    controller = module.get<DIDController>(DIDController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create an ethr DID', async () => {
      const did = await controller.create(Methods.Erc1056, {});
    });
  });
});
