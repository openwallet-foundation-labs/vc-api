import { IsString, IsArray, IsObject, IsOptional, ValidateNested } from 'class-validator';
import { VerifiableCredentialDto } from './verifiable-credential.dto';

/**
 * A JSON-LD Verifiable Presentation without a proof.
 * https://w3c-ccg.github.io/vc-api/holder.html#operation/provePresentation
 */
export class PresentationDto {
  /**
   * The JSON-LD context of the presentation.
   */
  @IsArray()
  @IsString({ each: true })
  '@context': string[];

  /**
   * The ID of the presentation.
   */
  @IsString()
  id: string;

  /**
   * The JSON-LD type of the presentation.
   */
  @IsArray()
  @IsString({ each: true })
  type: string[];

  /**
   * The holder - will be ignored if no proof is present since there is no proof of authority over the credentials
   */
  @IsString()
  @IsOptional()
  holder?: string;

  /**
   * The Verifiable Credentials
   */
  @ValidateNested()
  verifiableCredential: VerifiableCredentialDto[];
}
