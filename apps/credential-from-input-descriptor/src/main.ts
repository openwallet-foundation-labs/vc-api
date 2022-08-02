/*
 * Copyright 2021, 2022 Energy Web Foundation
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

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';
import { setupApp, setupSwaggerDocument } from './setup';
import { SwaggerModule } from '@nestjs/swagger';
import { readFile } from 'fs/promises';
import { resolve as resolvePath } from 'path';

async function bootstrap() {
  const logger = new Logger('bootstrap', { timestamp: true });
  logger.debug('starting');

  const app = await NestFactory.create(AppModule);
  setupApp(app);
  SwaggerModule.setup('api', app, setupSwaggerDocument(app));

  const port = parseInt(process.env.PORT) || 3000;
  await app.listen(port);

  try {
    console.log(
      '\n' +
        (await readFile(resolvePath(__dirname, '..', '..', '..', 'license-header.txt'))).toString() +
        '\n'
    );
  } catch (err) {
    logger.error(`license file not found: ${err}`);
  }

  logger.log(`listening on http://127.0.0.1:${port}`);
  logger.log(`Swagger available on http://127.0.0.1:${port}/api`);
}

bootstrap();
