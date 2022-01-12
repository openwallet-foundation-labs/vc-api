import { setupApp, setupSwaggerDocument } from './setup';

async function bootstrap() {
  const app = await setupApp();
  setupSwaggerDocument(app);
  await app.listen(3000);
}

bootstrap();
