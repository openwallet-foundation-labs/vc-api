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

import { classToPlain, plainToClass, Type } from 'class-transformer';
import { IsOptional, IsString, ValidateNested } from 'class-validator';
import { TransactionEntity } from '../entities/transaction.entity';
import { PresentationSubmissionDto } from './presentation-submission.dto';
import { VpRequestDto } from './vp-request.dto';

export class TransactionDto {
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
  @Type(() => PresentationSubmissionDto)
  @IsOptional()
  presentationSubmission?: PresentationSubmissionDto;

  // TODO: make generic so that it can be used in all Dtos
  static toDto(transaction: TransactionEntity): TransactionDto {
    const data = classToPlain(transaction);
    return plainToClass(TransactionEntity, data);
  }
}
