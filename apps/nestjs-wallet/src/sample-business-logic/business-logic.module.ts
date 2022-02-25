import { Module } from '@nestjs/common';
import { DidModule } from '../did/did.module';
import { VcApiModule } from '../vc-api/vc-api.module';
import { BusinessLogicController } from './business-logic.controller';
import { BusinessLogicService } from './business-logic.service';

@Module({
  imports: [DidModule, VcApiModule],
  providers: [BusinessLogicService],
  controllers: [BusinessLogicController]
})
export class EliaExchangeModule {}
