import { IsString, IsDate, IsArray, IsObject, IsOptional } from 'class-validator';

/**
 * A JSON-LD Verifiable Credential without a proof.
 * https://w3c-ccg.github.io/vc-api/issuer.html#operation/issueCredential
 */
export class CredentialDto {
  /**
   * The JSON-LD context of the credential.
   */
  @IsArray()
  @IsString({ each: true })
  '@context': string[];

  /**
   * The ID of the credential.
   */
  @IsString()
  id: string;

  /**
   * The JSON-LD type of the credential.
   */
  @IsArray()
  @IsString({ each: true })
  type: string[];

  /**
   * A JSON-LD Verifiable Credential Issuer.
   */
  @IsString()
  issuer: string;

  /**
   * The issuanceDate
   */
  @IsDate()
  issuanceDate: string;

  /**
   * The expirationDate
   */
  @IsString()
  @IsOptional()
  expirationDate?: string;

  /**
   * The subject
   */
  @IsObject()
  credentialSubject: Record<string, unknown>;
}
