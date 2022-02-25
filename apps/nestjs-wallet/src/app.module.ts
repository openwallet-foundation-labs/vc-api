import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { KeyModule } from './key/key.module';
import { DidModule } from './did/did.module';
import { VcApiModule } from './vc-api/vc-api.module';
import { TypeOrmSQLiteModule } from './in-memory-db';
import { EliaExchangeModule } from './sample-business-logic/business-logic.module';
import config from './config/configuration';

@Module({
  imports: [
    TypeOrmSQLiteModule(),
    KeyModule,
    DidModule,
    VcApiModule,
    EliaExchangeModule,
    ConfigModule.forRoot({ load: [config] })
  ]
})
export class AppModule {}
