/**
 * Copyright 2021 - 2023 Energy Web Foundation
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

import { DynamicModule, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { KeyModule } from './key/key.module';
import { DidModule } from './did/did.module';
import { VcApiModule } from './vc-api/vc-api.module';
import { TypeOrmSQLiteModule } from './in-memory-db';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { SeederModule } from './seeder/seeder.module';
import { envVarsValidationSchema } from './config/env-vars-validation-schema';

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
export class AppModule {}
