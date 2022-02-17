import { Test, TestingModule } from '@nestjs/testing';
import { EliaExchangeController } from './elia-exchange.controller';
import { EliaExchangeService } from './elia-exchange.service';

describe('EliaExchangeController', () => {
  let controller: EliaExchangeController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EliaExchangeController],
      providers: [
        {
          provide: EliaExchangeService,
          useValue: {}
        }
      ]
    }).compile();

    controller = module.get<EliaExchangeController>(EliaExchangeController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
