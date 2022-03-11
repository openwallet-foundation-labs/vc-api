import { ExchangeDefinitionDto } from '../../src/vc-api/exchanges/dtos/exchange-definition.dto';
import { VpRequestInteractServiceType } from '../../src/vc-api/exchanges/types/vp-request-interact-service-type';
import { VpRequestQueryType } from '../../src/vc-api/exchanges/types/vp-request-query-type';

export class ResidenceCardPresentation {
  #exchangeId = `b229a18f-db45-4b33-8d36-25d442467bab`;
  #callbackUrl: string;
  queryType = VpRequestQueryType.presentationDefinition;

  constructor(callbackUrl: string) {
    this.#callbackUrl = callbackUrl;
  }

  getExchangeId(): string {
    return this.#exchangeId;
  }

  getExchangeDefinition(): ExchangeDefinitionDto {
    const exchangeDefinition: ExchangeDefinitionDto = {
      exchangeId: this.#exchangeId,
      query: [
        {
          type: this.queryType,
          credentialQuery: [
            {
              id: '286bc1e0-f1bd-488a-a873-8d71be3c690e',
              input_descriptors: [
                {
                  id: 'permanent_resident_card',
                  name: 'Permanent Resident Card',
                  purpose: 'We can only allow permanent residents into the application'
                }
              ]
            }
          ]
        }
      ],
      interactServices: [
        {
          type: VpRequestInteractServiceType.unmediatedPresentation
        }
      ],
      isOneTime: true,
      callback: [
        {
          url: this.#callbackUrl
        }
      ]
    };
    return exchangeDefinition;
  }
}
