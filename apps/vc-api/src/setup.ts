/*
 * Copyright 2021 - 2023 Energy Web Foundation
 * SPDX-License-Identifier: Apache-2.0
 */

import { INestApplication, ValidationPipe, VersioningType } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, OpenAPIObject, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { TransactionEntityExceptionFilter } from './exception-filters/transaction-entity-exception.filter';

export const API_DEFAULT_VERSION = '1';
export const API_DEFAULT_VERSION_PREFIX = `/v${API_DEFAULT_VERSION}`;

async function setupApp(): Promise<INestApplication> {
  const app = await NestFactory.create(AppModule);
  app.enableCors({ origin: true });
  app.useGlobalPipes(new ValidationPipe());
  app.useGlobalFilters(new TransactionEntityExceptionFilter(app.getHttpAdapter()));
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: [API_DEFAULT_VERSION]
  });
  app.enableShutdownHooks();
  return app;
}

function setupSwaggerDocument(app: INestApplication): OpenAPIObject {
  const config = new DocumentBuilder()
    .setTitle('VC-API')
    .setDescription('Sample VC-API')
    .setVersion('0.1')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  return document;
}

export { setupApp, setupSwaggerDocument };
