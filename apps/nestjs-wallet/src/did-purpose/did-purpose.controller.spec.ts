import { Test, TestingModule } from '@nestjs/testing';
import { DIDPurposeController } from './did-purpose.controller';

describe('DidPurposeController', () => {
  let controller: DIDPurposeController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DIDPurposeController]
    }).compile();

    controller = module.get<DIDPurposeController>(DIDPurposeController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
