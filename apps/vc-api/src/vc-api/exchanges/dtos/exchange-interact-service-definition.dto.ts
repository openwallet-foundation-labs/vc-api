import { IsEnum, IsUrl } from 'class-validator';
import { VpRequestInteractServiceType } from '../types/vp-request-interact-service-type';

/**
 * A definition of an interact service to be used in a workflow
 */
export class ExchangeInteractServiceDefinitionDto {
  @IsEnum(VpRequestInteractServiceType)
  type: VpRequestInteractServiceType;
}
