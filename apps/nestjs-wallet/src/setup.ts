import { INestApplication, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function setupApp() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe());
  return app;
}

function setupSwaggerDocument(app: INestApplication) {
  const config = new DocumentBuilder()
    .setTitle('SSI Wallet API')
    .setDescription('Sample SSI Wallet NestJs API')
    .setVersion('0.1')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);
  return document;
}

export { setupApp, setupSwaggerDocument };
