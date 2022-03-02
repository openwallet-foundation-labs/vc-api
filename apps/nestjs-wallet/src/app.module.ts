import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { KeyModule } from './key/key.module';
import { DidModule } from './did/did.module';
import { VcApiModule } from './vc-api/vc-api.module';
import { TypeOrmSQLiteModule } from './in-memory-db';
import config from './config/configuration';

@Module({
  imports: [
    TypeOrmSQLiteModule(),
    KeyModule,
    DidModule,
    VcApiModule,
    ConfigModule.forRoot({ load: [config] })
  ]
})
export class AppModule {}
