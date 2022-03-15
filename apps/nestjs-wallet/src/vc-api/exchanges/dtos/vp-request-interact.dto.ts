import { Type } from 'class-transformer';
import { IsArray, ValidateNested } from 'class-validator';
import { VpRequestInteractServiceDto } from './vp-request-interact-service.dto';

/**
 * https://w3c-ccg.github.io/vp-request-spec/#interaction-types
 */
export class VpRequestInteractDto {
  @ValidateNested({ each: true })
  @IsArray()
  @Type(() => VpRequestInteractServiceDto)
  service: VpRequestInteractServiceDto[];
}
