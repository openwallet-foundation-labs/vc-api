import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DidModule } from '../did/did.module';
import { KeyModule } from '../key/key.module';
import { VcApiController } from './vc-api.controller';
import { VcApiService } from './vc-api.service';
import { ExchangeExecutionEntity } from './exchanges/entities/exchange-execution.entity';
import { VpRequestEntity } from './exchanges/entities/vp-request.entity';
import { ExchangeService } from './exchanges/exchange.service';

@Module({
  imports: [
    ConfigModule,
    DidModule,
    KeyModule,
    TypeOrmModule.forFeature([VpRequestEntity, ExchangeExecutionEntity])
  ],
  controllers: [VcApiController],
  providers: [VcApiService, ExchangeService],
  exports: [VcApiService, ExchangeService]
})
export class VcApiModule {}
