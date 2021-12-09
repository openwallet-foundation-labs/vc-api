import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EliaIssuerService } from './elia-issuer.service';
import { VpRequestEntity } from './entities/vp-request.entity';
import { EliaIssuerController } from './elia-issuer.controller';
import { VcApiModule } from '../vc-api/vc-api.module';
import { ActiveFlowEntity } from './entities/active-flow.entity';

@Module({
  imports: [ConfigModule, VcApiModule, TypeOrmModule.forFeature([VpRequestEntity, ActiveFlowEntity])],
  providers: [EliaIssuerService],
  controllers: [EliaIssuerController]
})
export class EliaIssuerModule {}
