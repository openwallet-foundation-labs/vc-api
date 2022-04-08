import { IsString, IsArray } from 'class-validator';
import { VerificationResult } from '../types/verification-result';

/**
 * A response object from verification of a credential or a presentation.
 * https://w3c-ccg.github.io/vc-api/verifier.html
 */
export class VerificationResultDto implements VerificationResult {
  /**
   * The checks performed
   */
  @IsArray()
  @IsString({ each: true })
  checks: string[];

  /**
   * Warnings
   */
  @IsArray()
  @IsString({ each: true })
  warnings: string[];

  /**
   * Errors
   */
  @IsArray()
  @IsString({ each: true })
  errors: string[];
}
