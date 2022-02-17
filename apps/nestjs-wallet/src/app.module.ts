import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { KeyModule } from './key/key.module';
import { DidModule } from './did/did.module';
import { DIDPurposeModule } from './did-purpose/did-purpose.module';
import { VcApiModule } from './vc-api/vc-api.module';
import { DIDContactModule } from './did-contact/did-contact.module';
import { TypeOrmSQLiteModule } from './in-memory-db';
import { EliaExchangeModule } from './elia-exchange/elia-exchange.module';

@Module({
  imports: [
    TypeOrmSQLiteModule(),
    ConfigModule.forRoot(),
    KeyModule,
    DidModule,
    DIDPurposeModule,
    VcApiModule,
    DIDContactModule,
    EliaExchangeModule
  ]
})
export class AppModule {}
