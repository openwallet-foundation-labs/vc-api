import { IsEnum, IsUrl } from 'class-validator';
import { VpRequestInteractServiceType } from '../types/vp-request-interact-service-type';

/**
 * A definition of an interact service to be used in a workflow
 */
export class ExchangeInteractServiceDefinitionDto {
  @IsEnum(VpRequestInteractServiceType)
  type: VpRequestInteractServiceType;

  /**
   * As details specific to the workflow (such as the workflow id) are not know,
   * the full serviceEndpoint cannot be specified. Instead the baseUrl is specified.
   * This allows a configured workflow response to be sent to another service endpoint.
   */
  @IsUrl()
  baseUrl: string;
}
