/*
 * Copyright 2021 - 2023 Energy Web Foundation
 * SPDX-License-Identifier: Apache-2.0
 */

import { instanceToPlain, plainToInstance, Type } from 'class-transformer';
import { IsOptional, IsString, ValidateNested } from 'class-validator';
import { TransactionEntity } from '../entities/transaction.entity';
import { PresentationSubmissionFullDto } from './presentation-submission-full.dto';
import { VpRequestDto } from './vp-request.dto';

export class CallbackDto {
  /**
   * An id for the transaction
   */
  @IsString()
  transactionId: string;

  /**
   * Each transaction is a part of an exchange
   * https://w3c-ccg.github.io/vc-api/#exchange-examples
   */
  @IsString()
  exchangeId: string;

  /**
   * https://w3c-ccg.github.io/vp-request-spec/
   */
  @ValidateNested()
  @Type(() => VpRequestDto)
  vpRequest: VpRequestDto;

  /**
   * The submission to the VP Request
   * Is optional because submission may not have occured yet
   */
  @ValidateNested()
  @Type(() => PresentationSubmissionFullDto)
  @IsOptional()
  presentationSubmission?: PresentationSubmissionFullDto;

  // TODO: make generic so that it can be used in all Dtos
  static toDto(transaction: TransactionEntity): CallbackDto {
    return plainToInstance(CallbackDto, instanceToPlain(transaction));
  }
}
