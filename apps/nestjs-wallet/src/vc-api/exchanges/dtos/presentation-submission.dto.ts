import { VerificationResultDto } from '../../credentials/dtos/verification-result.dto';
import { ValidateNested } from 'class-validator';
import { VerifiablePresentationDto } from '../../credentials/dtos/verifiable-presentation.dto';
import { Type } from 'class-transformer';

/**
 * Presentation Submission Dto.
 */
export class PresentationSubmissionDto {
  /**
   * The result of the verification of the submitted VP
   */
  @ValidateNested()
  @Type(() => VerificationResultDto)
  verificationResult: VerificationResultDto;

  /**
   * The Verifiable Presentation submitted in response to the transaction's VP Request
   */
  @ValidateNested()
  @Type(() => VerifiablePresentationDto)
  vp: VerifiablePresentationDto;
}
