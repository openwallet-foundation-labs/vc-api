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
