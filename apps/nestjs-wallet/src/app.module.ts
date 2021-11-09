import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { KeyModule } from './key/key.module';
import { DidModule } from './did/did.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EthrDID } from '@energyweb/ssi-did';
import { DIDPurposeModule } from './did-purpose/did-purpose.module';
import { CredentialsModule } from './credentials/credentials.module';
import { DIDContactModule } from './did-contact/did-contact.module';

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
    DidModule,
    DIDPurposeModule,
    CredentialsModule,
    DIDContactModule
  ],
})
export class AppModule {}
