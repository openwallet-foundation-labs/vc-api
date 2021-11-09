import { Module } from '@nestjs/common';
import { CredentialsController } from './credentials.controller';

@Module({
  controllers: [CredentialsController]
})
export class CredentialsModule {}
