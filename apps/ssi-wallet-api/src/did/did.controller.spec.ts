import { Methods } from '@ew-did-registry/did';
import { Test, TestingModule } from '@nestjs/testing';
import { DidController } from './did.controller';

describe('DidController', () => {
  let controller: DidController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DidController]
    }).compile();

    controller = module.get<DidController>(DidController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  xdescribe('create', () => {
    it('should create an ethr DID', async () => {
      const did = await controller.create(Methods.Erc1056, {});
      const method = did.split(':')[1];
      expect(method).toEqual(Methods.Erc1056);
    });
  });
});
