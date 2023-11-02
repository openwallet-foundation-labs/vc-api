/*
 * Copyright 2021 - 2023 Energy Web Foundation
 * SPDX-License-Identifier: Apache-2.0
 */

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { KeyModule } from '../key/key.module';
import { DIDController } from './did.controller';
import { DIDService } from './did.service';
import { DIDDocumentEntity } from './entities/did-document.entity';
import { VerificationMethodEntity } from './entities/verification-method.entity';

@Module({
  imports: [KeyModule, TypeOrmModule.forFeature([DIDDocumentEntity, VerificationMethodEntity])],
  controllers: [DIDController],
  providers: [DIDService],
  exports: [DIDService]
})
export class DidModule {}
