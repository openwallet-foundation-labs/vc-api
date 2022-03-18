import { IsEnum, IsUrl } from 'class-validator';
import { VpRequestInteractServiceType } from '../types/vp-request-interact-service-type';

/**
 * https://w3c-ccg.github.io/vp-request-spec/#interaction-types
 */
export class VpRequestInteractServiceDto {
  @IsEnum(VpRequestInteractServiceType)
  type: VpRequestInteractServiceType;

  /**
   * URL at which the credential exchange can be continued
   *
   * `require_tld: false` to allow localhost, see https://github.com/validatorjs/validator.js/issues/754
   */
  @IsUrl({ require_tld: false, require_protocol: true })
  serviceEndpoint: string;
}
