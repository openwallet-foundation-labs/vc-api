import { IsArray, IsOptional, IsString, ValidateNested } from 'class-validator';
import { VerifiableCredentialDto } from '../../vc-api/dto/verifiable-credential.dto';
import { VpRequestDto } from './vp-request.dto';

/**
 * Describes the possible contents of response to a start/continue workflow request
 */
export class WorkflowResponseDto {
  /**
   * Any errors encountered during workflow request processing
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

  @ValidateNested()
  @IsOptional()
  vc?: VerifiableCredentialDto;
}
