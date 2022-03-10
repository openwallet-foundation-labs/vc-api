import { Test, TestingModule } from '@nestjs/testing';
import { HttpModule } from '@nestjs/axios';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { TypeOrmSQLiteModule } from '../../in-memory-db';
import { Repository } from 'typeorm';
import { CredentialsService } from '../credentials/credentials.service';
import { ExchangeEntity } from './entities/exchange.entity';
import { VpRequestEntity } from './entities/vp-request.entity';
import { ExchangeService } from './exchange.service';
import { ExchangeDefinitionDto } from './dtos/exchange-definition.dto';
import { VpRequestInteractServiceType } from './types/vp-request-interact-service-type';
import { TransactionEntity } from './entities/transaction.entity';
import { VpRequestQueryType } from './types/vp-request-query-type';
import { PresentationReviewEntity } from './entities/presentation-review.entity';
import { ConfigService } from '@nestjs/config';

const baseUrl = 'https://test-exchange.com';

describe('ExchangeService', () => {
  let service: ExchangeService;
  let vcApiService: CredentialsService;
  let exchangeRepository: Repository<ExchangeEntity>;
  let vpRequestRepository: Repository<VpRequestEntity>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmSQLiteModule(),
        TypeOrmModule.forFeature([
          VpRequestEntity,
          ExchangeEntity,
          TransactionEntity,
          PresentationReviewEntity
        ]),
        HttpModule
      ],
      providers: [
        ExchangeService,
        {
          provide: CredentialsService,
          useValue: {}
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              return baseUrl;
            })
          }
        }
      ]
    }).compile();

    vcApiService = module.get<CredentialsService>(CredentialsService);
    service = module.get<ExchangeService>(ExchangeService);
    exchangeRepository = module.get<Repository<ExchangeEntity>>(getRepositoryToken(ExchangeEntity));
    vpRequestRepository = module.get<Repository<VpRequestEntity>>(getRepositoryToken(VpRequestEntity));
  });

  afterEach(async () => {
    jest.resetAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createExchange', () => {
    it('should accept a presentation definition in an exchange definition', async () => {
      const presentationDefinition = {
        id: '57ca126c-acbf-4da4-8f79-447150e93128',
        input_descriptors: [
          {
            id: 'permanent_resident_card',
            name: 'Permanent Resident Card',
            purpose: 'We can only allow permanent residents into the application'
          }
        ]
      };
      const exchangeDef = {
        exchangeId: 'permanent-resident-card-presentation',
        query: [
          {
            type: VpRequestQueryType.presentationDefinition,
            credentialQuery: [presentationDefinition]
          }
        ],
        interactServices: [
          {
            type: VpRequestInteractServiceType.unmediatedPresentation,
            baseUrl: 'https://example.org/'
          }
        ],
        isOneTime: false,
        callback: []
      };
      const result = await service.createExchange(exchangeDef);
      expect(result.errors).toHaveLength(0);
    });
  });

  describe('startExchange', () => {
    it('should start exchange from an exchange definition', async () => {
      const exchangeId = 'test-exchange';
      const exchangeDef: ExchangeDefinitionDto = {
        exchangeId: exchangeId,
        interactServices: [
          {
            type: VpRequestInteractServiceType.unmediatedPresentation
          }
        ],
        query: [],
        isOneTime: false,
        callback: []
      };
      await service.createExchange(exchangeDef);
      const exchangeResponse = await service.startExchange(exchangeId);
      expect(exchangeResponse.vpRequest.interact.service).toHaveLength(1);
      expect(exchangeResponse.vpRequest.interact.service[0].serviceEndpoint).toContain(baseUrl);
    });
  });
});
