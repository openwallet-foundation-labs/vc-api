/**
 * A JSON-LD Verifiable Credential without a proof.
 * https://w3c-ccg.github.io/vc-api/issuer.html#operation/issueCredential
 */
export interface Credential {
  '@context': string[];

  /**
   * The ID of the credential.
   */
  id: string;

  /**
   * The JSON-LD type of the credential.
   */
  type: string[];

  /**
   * A JSON-LD Verifiable Credential Issuer.
   */
  issuer: string;

  /**
   * The issuanceDate
   */
  issuanceDate: string;

  /**
   * The expirationDate
   */
  expirationDate?: string;

  /**
   * The subject
   */
  credentialSubject: Record<string, unknown>;
}
