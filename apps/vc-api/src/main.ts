/*
 * Copyright 2021 - 2023 Energy Web Foundation
 * SPDX-License-Identifier: Apache-2.0
 */

import { setupApp, setupSwaggerDocument } from './setup';
import { readFile } from 'fs/promises';
import { resolve as resolvePath } from 'path';
import { SwaggerModule } from '@nestjs/swagger';
import { SeederService } from './seeder/seeder.service';
import * as process from 'process';

async function bootstrap() {
  const app = await setupApp();
  SwaggerModule.setup('api', app, setupSwaggerDocument(app));
  await app.listen(process.env.PORT);

  // Seeding needed in order to be able to execute VC-API test suite
  // https://github.com/w3c-ccg/vc-api-test-suite
  await app.get(SeederService).seed();

  try {
    console.log(
      '\n' +
        (await readFile(resolvePath(__dirname, '..', '..', '..', '..', 'license-header.txt'))).toString() +
        '\n'
    );
  } catch (err) {
    console.error(`license file not found: ${err}`);
  }
}

void bootstrap();
