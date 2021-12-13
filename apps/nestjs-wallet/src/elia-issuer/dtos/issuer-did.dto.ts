import { IsArray, IsOptional, IsString, ValidateNested } from 'class-validator';
import { VerifiableCredentialDto } from '../../vc-api/dto/verifiable-credential.dto';
import { VpRequestEntity } from '../entities/vp-request.entity';

/**
 * Describes DID + Verification Method to use for issuing credentials
 */
export class IssuerDidDto {
  @IsString()
  DID: string;

  @IsString()
  verificationMethodURI: string;
}
