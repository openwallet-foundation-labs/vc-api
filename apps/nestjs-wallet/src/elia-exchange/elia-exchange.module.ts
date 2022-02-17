import { Module } from '@nestjs/common';
import { DidModule } from '../did/did.module';
import { VcApiModule } from '../vc-api/vc-api.module';
import { EliaExchangeController } from './elia-exchange.controller';
import { EliaExchangeService } from './elia-exchange.service';

@Module({
  imports: [DidModule, VcApiModule],
  providers: [EliaExchangeService],
  controllers: [EliaExchangeController]
})
export class EliaExchangeModule {}
