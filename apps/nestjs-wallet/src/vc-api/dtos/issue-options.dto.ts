import { ProofPurpose } from '@sphereon/pex';
import { IsString, IsObject, IsOptional } from 'class-validator';

/**
 * Options for specifying how the LinkedDataProof is created.
 * https://w3c-ccg.github.io/vc-api/issuer.html#operation/issueCredential
 */
export class IssueOptionsDto {
  /**
   * The type of the proof. Default is an appropriate proof type corresponding to the verification method.
   */
  @IsString()
  @IsOptional()
  type?: string;

  /**
   * The URI of the verificationMethod used for the proof. Default assertionMethod URI.
   */
  @IsString()
  verificationMethod: string;

  /**
   * The purpose of the proof. Default 'assertionMethod'.
   */
  @IsString()
  @IsOptional()
  proofPurpose?: ProofPurpose;

  /**
   * The date and time of the proof (with a maximum accuracy in seconds). Default current system time.
   */
  @IsString()
  @IsOptional()
  created?: string;

  /**
   * A challenge provided by the requesting party of the proof. For example 6e62f66e-67de-11eb-b490-ef3eeefa55f2
   */
  @IsString()
  @IsOptional()
  challenge?: string;

  /**
   * The intended domain of validity for the proof. For example website.example
   */
  @IsString()
  @IsOptional()
  domain?: string;

  /**
   * The method of credential status to issue the credential including. If omitted credential status will be included.
   */
  @IsObject()
  @IsOptional()
  credentialStatus?: Record<string, unknown>;
}
