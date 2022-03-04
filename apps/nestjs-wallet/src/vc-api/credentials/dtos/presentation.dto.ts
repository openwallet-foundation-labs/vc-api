import { IsString, IsArray, IsOptional, ValidateNested } from 'class-validator';
import { VerifiableCredentialDto } from './verifiable-credential.dto';
import { IsStringOrStringArray } from './custom-class-validator/is-string-or-string-array';
import { Presentation } from '../../exchanges/types/presentation';

/**
 * A JSON-LD Verifiable Presentation without a proof.
 * https://w3c-ccg.github.io/vc-api/holder.html#operation/provePresentation
 */
export class PresentationDto implements Presentation {
  /**
   * The JSON-LD context of the presentation.
   */
  @IsArray()
  @IsString({ each: true })
  '@context': string[];

  /**
   * The ID of the presentation.
   * The id property is optional and MAY be used to provide a unique identifier for the presentation.
   * https://www.w3.org/TR/vc-data-model/#presentations-0
   */
  @IsString()
  @IsOptional()
  id?: string;

  /**
   * The JSON-LD type of the presentation.
   */
  @IsStringOrStringArray()
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
