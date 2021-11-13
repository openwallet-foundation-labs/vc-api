import { Module } from '@nestjs/common';
import { DidModule } from '../did/did.module';
import { KeyModule } from '../key/key.module';
import { CredentialsController } from './credentials.controller';
import { CredentialsService } from './credentials.service';

@Module({
  imports: [DidModule, KeyModule],
  controllers: [CredentialsController],
  providers: [CredentialsService]
})
export class CredentialsModule {}
