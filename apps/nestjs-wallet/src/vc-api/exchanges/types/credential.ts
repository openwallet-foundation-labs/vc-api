/**
 * A JSON-LD Verifiable Credential without a proof.
 * https://w3c-ccg.github.io/vc-api/issuer.html#operation/issueCredential
 */
export interface Credential {
  // Needed to match @sphereon/pex type
  // https://github.com/Sphereon-Opensource/pex/blob/a1f56d6baabf1b0e1e28a08d04ffc97d76863207/lib/types/SSI.types.ts#L87
  [x: string]: unknown;

  '@context': Array<string | Record<string, any>>;

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
