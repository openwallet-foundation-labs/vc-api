/*
 * Copyright 2021 - 2023 Energy Web Foundation
 * SPDX-License-Identifier: Apache-2.0
 */

import { classToPlain, plainToClass, Type } from 'class-transformer';
import { IsOptional, IsString, ValidateNested } from 'class-validator';
import { TransactionEntity } from '../entities/transaction.entity';
import { PresentationSubmissionSecureDto } from './presentation-submission-secure.dto';
import { VpRequestDto } from './vp-request.dto';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class TransactionDto {
  @IsString()
  @ApiProperty({ description: 'An id for the transaction' })
  transactionId: string;

  @IsString()
  @ApiProperty({
    description:
      'Each transaction is a part of an exchange\n' + 'https://w3c-ccg.github.io/vc-api/#exchange-examples'
  })
  exchangeId: string;

  @ValidateNested()
  @Type(() => VpRequestDto)
  @ApiProperty({ description: 'https://w3c-ccg.github.io/vp-request-spec' })
  vpRequest: VpRequestDto;

  @ValidateNested()
  @Type(() => PresentationSubmissionSecureDto)
  @IsOptional()
  @ApiPropertyOptional({
    description: 'The submission to the VP Request\nIs optional because submission may not have occured yet'
  })
  presentationSubmission?: PresentationSubmissionSecureDto;

  // TODO: make generic so that it can be used in all Dtos
  static toDto(transaction: TransactionEntity): TransactionDto {
    const data = classToPlain(transaction);
    return plainToClass(TransactionDto, data);
  }
}
