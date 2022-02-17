import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DidModule } from '../did/did.module';
import { KeyModule } from '../key/key.module';
import { VcApiController } from './vc-api.controller';
import { VcApiService } from './vc-api.service';
import { ActiveFlowEntity } from './workflow/entities/active-flow.entity';
import { VpRequestEntity } from './workflow/entities/vp-request.entity';
import { WorkflowService } from './workflow/workflow.service';

@Module({
  imports: [
    ConfigModule,
    DidModule,
    KeyModule,
    TypeOrmModule.forFeature([VpRequestEntity, ActiveFlowEntity])
  ],
  controllers: [VcApiController],
  providers: [VcApiService, WorkflowService],
  exports: [VcApiService, WorkflowService]
})
export class VcApiModule {}
