import { IsObject } from 'class-validator';
import { CredentialDto } from './credential.dto';

/**
 * A JSON-LD Verifiable Credential with a proof.
 * https://w3c-ccg.github.io/vc-api/issuer.html#operation/issueCredential
 */
export class VerifiableCredentialDto extends CredentialDto {
  /**
   * A JSON-LD Linked Data proof.
   */
  @IsObject()
  proof: Record<string, unknown>;
}
