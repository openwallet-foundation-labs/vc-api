import { Presentation } from './presentation';

/**
 * A JSON-LD Verifiable Presentation with a proof.
 * https://w3c-ccg.github.io/vc-api/verifier.html#operation/verifyPresentation
 */
export interface VerifiablePresentation extends Presentation {
  /**
   * A JSON-LD Linked Data proof.
   */
  proof: Record<string, unknown>;
}
