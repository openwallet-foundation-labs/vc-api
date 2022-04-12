import { IsArray, IsBoolean, IsNumber, IsString, ValidateNested } from 'class-validator';
import { VpRequestQueryDto } from './vp-request-query.dto';
import { ExchangeInteractServiceDefinitionDto } from './exchange-interact-service-definition.dto';
import { CallbackConfigurationDto } from './callback-configuration.dto';
import { Type } from 'class-transformer';

/**
 * A exchange definition
 */
export class ExchangeDefinitionDto {
  @IsString()
  exchangeId: string;

  @ValidateNested()
  @IsArray()
  @Type(() => ExchangeInteractServiceDefinitionDto)
  interactServices: ExchangeInteractServiceDefinitionDto[];

  @ValidateNested({ each: true })
  @IsArray()
  @Type(() => VpRequestQueryDto)
  query: VpRequestQueryDto[];

  @IsBoolean()
  isOneTime: boolean;

  @ValidateNested({ each: true })
  @IsArray()
  @Type(() => CallbackConfigurationDto)
  callback: CallbackConfigurationDto[];
}
