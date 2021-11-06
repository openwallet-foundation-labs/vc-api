import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DIDController } from './did/did.controller';
import { DIDService } from './did/did.service';
import { KeyService } from './key/key.service';
import { KeyModule } from './key/key.module';
import { DidModule } from './did/did.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EthrDID } from '@energyweb/ssi-did';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'better-sqlite3',
      database: ':memory:',
      dropSchema: true,
      entities: [EthrDID],
      synchronize: true,
    }),
    ConfigModule.forRoot(),
    KeyModule, 
    DidModule
  ]
})
export class AppModule {}
