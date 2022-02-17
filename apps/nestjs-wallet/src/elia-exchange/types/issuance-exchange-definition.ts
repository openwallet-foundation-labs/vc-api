import { VerifiablePresentationDto } from '../../vc-api/dtos/verifiable-presentation.dto';
import { ExchangeResponseDto } from 'src/vc-api/exchanges/dtos/exchange-response.dto';

/**
 * A workflow definition for credential issuance
 */
export interface IssuanceExchangeDefinition {
  handlePresentation: (vp: VerifiablePresentationDto) => Promise<ExchangeResponseDto>;
}
