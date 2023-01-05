/*
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

import { AppModule } from '../src';
import { setupSwaggerDocument } from '../src/setup';
import { writeFile } from 'fs/promises';
import path from 'path';
import { Test } from '@nestjs/testing';

(async () => {
  const module = await Test.createTestingModule({
    imports: [AppModule]
  }).compile();

  const app = module.createNestApplication(undefined, { logger: false });
  const doc = setupSwaggerDocument(app);
  await writeFile(path.join(__dirname, '..', 'docs', 'openapi.json'), JSON.stringify(doc, null, 2));
})();
