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
