import { VerifiableCredential } from './verifiable-credential';

/**
 * A JSON-LD Verifiable Presentation without a proof.
 * https://w3c-ccg.github.io/vc-api/holder.html#operation/provePresentation
 */
export interface Presentation {
  /**
   * The JSON-LD context of the presentation.
   */
  '@context': Array<string | Record<string, any>>;

  /**
   * The ID of the presentation.
   * The id property is optional and MAY be used to provide a unique identifier for the presentation.
   * https://www.w3.org/TR/vc-data-model/#presentations-0
   */
  id?: string;

  /**
   * The JSON-LD type of the presentation.
   */
  type: string[];

  /**
   * The holder - will be ignored if no proof is present since there is no proof of authority over the credentials
   */
  holder?: string;

  /**
   * The Verifiable Credentials
   */
  verifiableCredential: VerifiableCredential[];
}
