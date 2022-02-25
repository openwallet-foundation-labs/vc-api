import { VerifiablePresentationDto } from '../../vc-api/dtos/verifiable-presentation.dto';
import { ExchangeResponseDto } from 'src/vc-api/exchanges/dtos/exchange-response.dto';

/**
 * An exchange definition for credential issuance
 */
export interface IssuanceExchangeDefinition {
  handlePresentation: (vp: VerifiablePresentationDto) => Promise<ExchangeResponseDto>;
}
