import { IsArray, IsOptional, IsString, ValidateNested } from 'class-validator';
import { VerifiableCredentialDto } from '../../dtos/verifiable-credential.dto';
import { AckPresentationDto } from './ack-presentation.dto';
import { VpRequestDto } from './vp-request.dto';

/**
 * Describes the possible contents of response to a start/continue exchange request
 */
export class ExchangeResponseDto {
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

  /**
   * If it is an issuance response, then a vc may be provided
   */
  @ValidateNested()
  @IsOptional()
  vc?: VerifiableCredentialDto;

  /**
   * Indicated the status of the presentation request
   * https://github.com/hyperledger/aries-rfcs/tree/main/features/0454-present-proof-v2#ack-presentation
   * https://github.com/hyperledger/aries-rfcs/blob/main/features/0015-acks/README.md#aries-rfc-0015-acks
   */
  @ValidateNested()
  ack: AckPresentationDto;
}
