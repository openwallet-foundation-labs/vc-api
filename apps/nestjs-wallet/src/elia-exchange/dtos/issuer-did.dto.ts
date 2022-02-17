import { IsString } from 'class-validator';

/**
 * Describes DID + Verification Method to use for issuing credentials
 */
export class IssuerDidDto {
  @IsString()
  DID: string;

  @IsString()
  verificationMethodURI: string;
}
