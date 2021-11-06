import { EthrDID } from '@energyweb/ssi-did';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { KeyModule } from '../key/key.module';
import { DIDController } from './did.controller';
import { DIDService } from './did.service';

@Module({
  imports: [KeyModule, TypeOrmModule.forFeature([EthrDID])],
  controllers: [DIDController],
  providers: [DIDService]
})
export class DidModule {}
