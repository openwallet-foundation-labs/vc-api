import { ConfigModule } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DidModule } from '../did/did.module';
import { TypeOrmSQLiteModule } from '../in-memory-db';
import { KeyModule } from '../key/key.module';
import { VcApiController } from './vc-api.controller';
import { VcApiService } from './vc-api.service';
import { ExchangeExecutionEntity } from './exchanges/entities/exchange-execution.entity';
import { VpRequestEntity } from './exchanges/entities/vp-request.entity';
import { ExchangeService } from './exchanges/exchange.service';

describe('VcApiController', () => {
  let controller: VcApiController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [VcApiController],
      providers: [
        {
          provide: VcApiService,
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
