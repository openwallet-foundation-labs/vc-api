import { IsString, IsArray } from 'class-validator';

/**
 * A response object from verification of a credential or a presentation.
 * https://w3c-ccg.github.io/vc-api/verifier.html
 */
export interface VerificationResult {
  /**
   * The checks performed
   */
  checks: string[];

  /**
   * Warnings
   */
  warnings: string[];

  /**
   * Errors
   */
  errors: string[];
}
