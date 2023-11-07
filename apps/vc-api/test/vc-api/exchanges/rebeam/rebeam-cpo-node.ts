/*
 * Copyright 2021 - 2023 Energy Web Foundation
 * SPDX-License-Identifier: Apache-2.0
 */

import { plainToClass } from 'class-transformer';
import { presentationDefinition } from '../../credential.service.spec.data';
import { ExchangeDefinitionDto } from '../../../../src/vc-api/exchanges/dtos/exchange-definition.dto';
import { VpRequestInteractServiceType } from '../../../../src/vc-api/exchanges/types/vp-request-interact-service-type';
import { VpRequestQueryType } from '../../../../src/vc-api/exchanges/types/vp-request-query-type';

export class RebeamCpoNode {
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
              presentationDefinition
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
    return plainToClass(ExchangeDefinitionDto, exchangeDefinition);
  }

  getInvalidExchangeDefinition(): ExchangeDefinitionDto {
    const exchangeDefinition: ExchangeDefinitionDto = {
      exchangeId: this.#exchangeId,
      query: [
        {
          type: this.queryType,
          credentialQuery: [
            {
              presentationDefinition: {
                id: '286bc1e0-f1bd-488a-a873-8d71be3c690e',
                input_descriptors: [
                  {
                    id: 'energy_supplier_customer_contract'
                  }
                ]
              }
            },
            {
              presentationDefinition: {
                id: '286bc1e0-f1bd-488a-a873-8d71be3c690c',
                input_descriptors: [
                  {
                    id: 'energy_supplier_employer_contract'
                  }
                ]
              }
            }
          ]
        }
      ],
      interactServices: [],
      isOneTime: true,
      callback: []
    };
    return plainToClass(ExchangeDefinitionDto, exchangeDefinition);
  }
}
