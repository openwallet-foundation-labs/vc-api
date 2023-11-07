/*
 * Copyright 2021 - 2023 Energy Web Foundation
 * SPDX-License-Identifier: Apache-2.0
 */

import { DynamicModule, MiddlewareConsumer, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { KeyModule } from './key/key.module';
import { DidModule } from './did/did.module';
import { VcApiModule } from './vc-api/vc-api.module';
import { TypeOrmSQLiteModule } from './in-memory-db';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { SeederModule } from './seeder/seeder.module';
import { envVarsValidationSchema } from './config/env-vars-validation-schema';
import { HttpLoggerMiddleware } from './middlewares';

let config: DynamicModule;

try {
  config = ConfigModule.forRoot({
    isGlobal: true,
    validationOptions: {
      allowUnknown: true,
      abortEarly: false
    },
    validationSchema: envVarsValidationSchema
  });
} catch (err) {
  console.log(err.toString());
  console.log('exiting');
  // eslint-disable-next-line no-process-exit
  process.exit(1);
}

@Module({
  imports: [
    TypeOrmSQLiteModule(),
    KeyModule,
    DidModule,
    VcApiModule,
    config,
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '../..', 'static-assets', '.well-known'),
      serveStaticOptions: {
        index: false
      },
      serveRoot: '/.well-known'
    }),
    SeederModule
  ]
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(HttpLoggerMiddleware) //, HttpsRedirectMiddleware) - Disabling for now, doesn't work as expected
      .forRoutes('*');
  }
}
