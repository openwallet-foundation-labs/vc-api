/*
 * Copyright 2021 - 2023 Energy Web Foundation
 * SPDX-License-Identifier: Apache-2.0
 */

import { writeFileSync } from 'fs';
import * as path from 'path';
import { API_DEFAULT_VERSION, setupApp, setupSwaggerDocument } from '../src/setup';
import { Test } from '@nestjs/testing';
import { AppModule } from '../src';
import { VersioningType } from '@nestjs/common';

/**
 * https://stackoverflow.com/questions/64927411/how-to-generate-openapi-specification-with-nestjs-without-running-the-applicatio
 */
(async () => {
  const module = await Test.createTestingModule({
    imports: [AppModule]
  }).compile();

  const app = module.createNestApplication(undefined, { logger: false });

  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: [API_DEFAULT_VERSION]
  });

  const doc = setupSwaggerDocument(app);
  const outputPath = path.resolve(process.cwd(), 'docs', 'openapi.json');
  writeFileSync(outputPath, JSON.stringify(doc), { encoding: 'utf8' });
  console.log('open-api json written');
})();
