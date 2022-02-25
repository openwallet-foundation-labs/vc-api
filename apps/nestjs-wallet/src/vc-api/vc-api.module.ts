import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DidModule } from '../did/did.module';
import { KeyModule } from '../key/key.module';
import { VcApiController } from './vc-api.controller';
import { VcApiService } from './vc-api.service';
import { ExchangeService } from './exchanges/exchange.service';
import { ExchangeEntity } from './exchanges/entities/exchange.entity';
import { VpRequestEntity } from './exchanges/entities/vp-request.entity';
import { TransactionEntity } from './exchanges/entities/transaction.entity';
import { PresentationReviewEntity } from './exchanges/entities/presentation-review.entity';

@Module({
  imports: [
    DidModule,
    KeyModule,
    TypeOrmModule.forFeature([VpRequestEntity, ExchangeEntity, TransactionEntity, PresentationReviewEntity]),
    ConfigModule
  ],
  controllers: [VcApiController],
  providers: [VcApiService, ExchangeService],
  exports: [VcApiService, ExchangeService]
})
export class VcApiModule {}
