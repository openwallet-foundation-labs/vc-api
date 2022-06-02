import { Test, TestingModule } from '@nestjs/testing';
import { KeyController } from './key.controller';
import { KeyService } from './key.service';

describe('KeyController', () => {
  let controller: KeyController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [KeyController],
      providers: [
        {
          provide: KeyService,
          useValue: {}
        }
      ]
    }).compile();

    controller = module.get<KeyController>(KeyController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
