import { Module } from '@nestjs/common';
import { DidModule } from '../did/did.module';
import { KeyModule } from '../key/key.module';
import { VcApiController } from './vc-api.controller';
import { VcApiService } from './vc-api.service';

@Module({
  imports: [DidModule, KeyModule],
  controllers: [VcApiController],
  providers: [VcApiService],
  exports: [VcApiService]
})
export class VcApiModule {}
