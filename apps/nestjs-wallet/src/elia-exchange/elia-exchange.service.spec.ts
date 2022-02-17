import { Test, TestingModule } from '@nestjs/testing';
import { DIDService } from '../did/did.service';
import { VcApiService } from '../vc-api/vc-api.service';
import { ExchangeService } from '../vc-api/exchanges/exchange.service';
import { EliaExchangeService } from './elia-exchange.service';

describe('EliaWorkflowService', () => {
  let service: EliaExchangeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EliaExchangeService,
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

    service = module.get<EliaExchangeService>(EliaExchangeService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
