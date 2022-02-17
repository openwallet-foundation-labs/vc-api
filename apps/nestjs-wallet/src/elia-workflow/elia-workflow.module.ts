import { Module } from '@nestjs/common';
import { DidModule } from '../did/did.module';
import { VcApiModule } from '../vc-api/vc-api.module';
import { EliaWorkflowController } from './elia-workflow.controller';
import { EliaWorkflowService } from './elia-workflow.service';

@Module({
  imports: [DidModule, VcApiModule],
  providers: [EliaWorkflowService],
  controllers: [EliaWorkflowController]
})
export class EliaWorkflowModule {}
