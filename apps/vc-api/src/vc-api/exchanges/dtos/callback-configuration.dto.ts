import { IsUrl } from 'class-validator';
import { CallbackConfiguration } from '../types/callback-configuration';

/**
 * An exchange result callback
 */
export class CallbackConfigurationDto implements CallbackConfiguration {
  /**
   * URL at a callback notification will be sent after the exchange has completed.
   *
   * `require_tld: false` to allow localhost, see https://github.com/validatorjs/validator.js/issues/754
   */
  @IsUrl({ require_tld: false, require_protocol: true })
  url: string;
}
