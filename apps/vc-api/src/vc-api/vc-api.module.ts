/*
 * Copyright 2021 - 2023 Energy Web Foundation
 * SPDX-License-Identifier: Apache-2.0
 */

import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DidModule } from '../did/did.module';
import { KeyModule } from '../key/key.module';
import { VcApiController } from './vc-api.controller';
import { CredentialsService } from './credentials/credentials.service';
import { ExchangeService } from './exchanges/exchange.service';
import { ExchangeEntity } from './exchanges/entities/exchange.entity';
import { VpRequestEntity } from './exchanges/entities/vp-request.entity';
import { TransactionEntity } from './exchanges/entities/transaction.entity';
import { PresentationReviewEntity } from './exchanges/entities/presentation-review.entity';
import { PresentationSubmissionEntity } from './exchanges/entities/presentation-submission.entity';
import { VpSubmissionVerifierService } from './exchanges/vp-submission-verifier.service';

@Module({
  imports: [
    DidModule,
    KeyModule,
    TypeOrmModule.forFeature([
      VpRequestEntity,
      ExchangeEntity,
      TransactionEntity,
      PresentationReviewEntity,
      PresentationSubmissionEntity
    ]),
    ConfigModule,
    HttpModule
  ],
  controllers: [VcApiController],
  providers: [CredentialsService, ExchangeService, VpSubmissionVerifierService],
  exports: [CredentialsService, ExchangeService]
})
export class VcApiModule {}
