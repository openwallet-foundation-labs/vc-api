import { IsArray, IsUrl } from 'class-validator';

/**
 * https://w3c-ccg.github.io/vp-request-spec/#interaction-types
 */
export class VpRequestInteractServiceDto {
  @IsArray()
  type: string;

  @IsUrl()
  serviceEndpoint: string;
}
