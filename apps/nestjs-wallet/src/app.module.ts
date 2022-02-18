import { Module } from '@nestjs/common';
import { KeyModule } from './key/key.module';
import { DidModule } from './did/did.module';
import { VcApiModule } from './vc-api/vc-api.module';
import { TypeOrmSQLiteModule } from './in-memory-db';
import { EliaExchangeModule } from './elia-exchange/elia-exchange.module';

@Module({
  imports: [TypeOrmSQLiteModule(), KeyModule, DidModule, VcApiModule, EliaExchangeModule]
})
export class AppModule {}
