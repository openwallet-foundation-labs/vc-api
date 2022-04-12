import { IsArray, IsOptional, IsString, ValidateNested } from 'class-validator';
import { VerifiablePresentationDto } from 'src/vc-api/credentials/dtos/verifiable-presentation.dto';
import { VpRequestDto } from './vp-request.dto';

/**
 * Describes the possible contents of response to a start/continue exchange request
 */
export class ExchangeResponseDto {
  /**
   * Any errors encountered during exchange
   */
  @IsArray()
  @IsString({ each: true })
  errors: string[];

  /**
   * Verifiable Presentation Request.
   * Should conform to VP-Request specification.
   * Will be returned if a VP is required to obtain more information from requester
   * May not be returned if no further information is required (for example, at the end of the workflow)
   */
  @ValidateNested()
  @IsOptional()
  vpRequest?: VpRequestDto;

  /**
   * If it is an issuance response, then a vp may be provided
   */
  @ValidateNested()
  @IsOptional()
  vp?: VerifiablePresentationDto;
}
