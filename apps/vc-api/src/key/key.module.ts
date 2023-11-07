/*
 * Copyright 2021 - 2023 Energy Web Foundation
 * SPDX-License-Identifier: Apache-2.0
 */

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { KeyPair } from './key-pair.entity';
import { KeyService } from './key.service';
import { KeyController } from './key.controller';

@Module({
  imports: [TypeOrmModule.forFeature([KeyPair])],
  providers: [KeyService],
  exports: [KeyService],
  controllers: [KeyController]
})
export class KeyModule {}
