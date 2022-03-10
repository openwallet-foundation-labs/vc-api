import { IsUrl } from 'class-validator';
import { CallbackConfiguration } from '../types/callback-configuration';

/**
 * An exchange result callback
 */
export class CallbackConfigurationDto implements CallbackConfiguration {
  @IsUrl()
  url: string;
}
