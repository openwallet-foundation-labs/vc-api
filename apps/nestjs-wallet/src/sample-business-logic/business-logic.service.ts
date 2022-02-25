import { Injectable } from '@nestjs/common';
import { IssuanceExchangeDefinition } from './types/issuance-exchange-definition';
import { VcApiService } from '../vc-api/vc-api.service';
import { ExchangeService } from '../vc-api/exchanges/exchange.service';
import { ExchangeResponseDto } from '../vc-api/exchanges/dtos/exchange-response.dto';
import { ExchangeId } from './types/exchange-id';
import { ResidentCardIssuanceExchange } from './exchange-definitions/resident-card-issuance.exchange';
import { VerifiablePresentationDto } from '../vc-api/dtos/verifiable-presentation.dto';
import { DIDService } from '../did/did.service';

@Injectable()
export class BusinessLogicService {
  #exchangeDefinitions: Record<string, IssuanceExchangeDefinition>;

  constructor(
    private vcApiService: VcApiService,
    private exchangeService: ExchangeService,
    private didService: DIDService
  ) {
    this.#exchangeDefinitions = {
      [ExchangeId.permanent_resident_card_issuance]: new ResidentCardIssuanceExchange(
        vcApiService,
        didService
      )
    };
  }

  public async handlePresentation(
    vp: VerifiablePresentationDto,
    transactionId: string,
    exchangeId: string
  ): Promise<ExchangeResponseDto> {
    const exchangeTransactionStatus = await this.exchangeService.getExchangeTransaction(transactionId);
    if (exchangeTransactionStatus.transaction.exchangeId !== exchangeId) {
      return {
        errors: [
          `${exchangeId}: submitted exchange id does not match expected exchange id for this transaction`
        ]
      };
    }
    const exchangeDefinition = this.#exchangeDefinitions[exchangeId];
    if (!exchangeDefinition) {
      return {
        errors: [`${exchangeId}: no exchange definition found for this workflowtype`]
      };
    }
    const { errors } = await this.exchangeService.handlePresentation(vp, transactionId, exchangeId);
    if (errors.length > 0) {
      return {
        errors
      };
    }
    return await exchangeDefinition.handlePresentation(vp);
  }
}
