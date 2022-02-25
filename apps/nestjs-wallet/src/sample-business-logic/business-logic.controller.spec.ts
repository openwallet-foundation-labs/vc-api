import { Test, TestingModule } from '@nestjs/testing';
import { BusinessLogicController } from './business-logic.controller';
import { BusinessLogicService } from './business-logic.service';

describe('EliaExchangeController', () => {
  let controller: BusinessLogicController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BusinessLogicController],
      providers: [
        {
          provide: BusinessLogicService,
          useValue: {}
        }
      ]
    }).compile();

    controller = module.get<BusinessLogicController>(BusinessLogicController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
