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
