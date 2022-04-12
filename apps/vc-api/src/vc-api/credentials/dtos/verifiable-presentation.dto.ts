import { IsObject } from 'class-validator';
import { PresentationDto } from './presentation.dto';

/**
 * A JSON-LD Verifiable Presentation with a proof.
 * https://w3c-ccg.github.io/vc-api/verifier.html#operation/verifyPresentation
 */
export class VerifiablePresentationDto extends PresentationDto {
  /**
   * A JSON-LD Linked Data proof.
   */
  @IsObject()
  proof: Record<string, unknown>;
}
