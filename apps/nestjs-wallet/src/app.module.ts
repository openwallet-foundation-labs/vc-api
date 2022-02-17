import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { KeyModule } from './key/key.module';
import { DidModule } from './did/did.module';
import { DIDPurposeModule } from './did-purpose/did-purpose.module';
import { VcApiModule } from './vc-api/vc-api.module';
import { DIDContactModule } from './did-contact/did-contact.module';
import { TypeOrmSQLiteModule } from './in-memory-db';
import { EliaWorkflowModule } from './elia-workflow/elia-workflow.module';

@Module({
  imports: [
    TypeOrmSQLiteModule(),
    ConfigModule.forRoot(),
    KeyModule,
    DidModule,
    DIDPurposeModule,
    VcApiModule,
    DIDContactModule,
    EliaWorkflowModule
  ]
})
export class AppModule {}
