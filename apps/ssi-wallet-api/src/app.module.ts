import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DIDController } from './did/did.controller';
import { DIDService } from './did/did.service';
import { KeyService } from './key/key.service';
import { KeyModule } from './key/key.module';
import { DidModule } from './did/did.module';

@Module({
  imports: [ConfigModule.forRoot(), KeyModule, DidModule],
  controllers: [DIDController],
  providers: [DIDService, KeyService]
})
export class AppModule {}
