import { Test, TestingModule } from '@nestjs/testing';
import { VcApiController } from './vc-api.controller';
import { CredentialsService } from './credentials/credentials.service';
import { ExchangeService } from './exchanges/exchange.service';

describe('VcApiController', () => {
  let controller: VcApiController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [VcApiController],
      providers: [
        {
          provide: CredentialsService,
          useValue: {}
        },
        {
          provide: ExchangeService,
          useValue: {}
        }
      ]
    }).compile();

    controller = module.get<VcApiController>(VcApiController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
