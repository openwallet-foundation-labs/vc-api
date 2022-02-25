import { Test, TestingModule } from '@nestjs/testing';
import { DIDService } from '../did/did.service';
import { VcApiService } from '../vc-api/vc-api.service';
import { ExchangeService } from '../vc-api/exchanges/exchange.service';
import { BusinessLogicService } from './business-logic.service';

describe('BusinessLogicService', () => {
  let service: BusinessLogicService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BusinessLogicService,
        {
          provide: VcApiService,
          useValue: {}
        },
        {
          provide: ExchangeService,
          useValue: {}
        },
        {
          provide: DIDService,
          useValue: {}
        }
      ]
    }).compile();

    service = module.get<BusinessLogicService>(BusinessLogicService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
