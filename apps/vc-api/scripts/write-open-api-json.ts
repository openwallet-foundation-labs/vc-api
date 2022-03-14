/**
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

import { writeFileSync } from 'fs';
import * as path from 'path';
import { setupApp, setupSwaggerDocument } from '../src/setup';

/**
 * https://stackoverflow.com/questions/64927411/how-to-generate-openapi-specification-with-nestjs-without-running-the-applicatio
 */
(async () => {
  const app = await setupApp();
  const doc = setupSwaggerDocument(app);
  const outputPath = path.resolve(process.cwd(), 'docs', 'openapi.json');
  writeFileSync(outputPath, JSON.stringify(doc), { encoding: 'utf8' });
  console.log('open-api json written');
})();
