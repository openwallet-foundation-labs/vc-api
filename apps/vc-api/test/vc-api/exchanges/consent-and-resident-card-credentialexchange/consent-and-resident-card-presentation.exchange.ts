/**
 * Copyright 2021 - 2023 Energy Web Foundation
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

import { Rules } from '@sphereon/pex-models';
import { plainToClass } from 'class-transformer';
import { ExchangeDefinitionDto } from '../../../../src/vc-api/exchanges/dtos/exchange-definition.dto';
import { VpRequestInteractServiceType } from '../../../../src/vc-api/exchanges/types/vp-request-interact-service-type';
import { VpRequestQueryType } from '../../../../src/vc-api/exchanges/types/vp-request-query-type';

export class ConsentAndResidentCardPresentation {
  #exchangeIdV1 = `b229a18f-db45-4b33-8d36-25d442467bab`;
  #exchangeIdV2 = `b229a18f-db45-4b33-8d36-25d442467aba`;
  #callbackUrl: string;
  queryType = VpRequestQueryType.presentationDefinition;

  constructor(callbackUrl: string) {
    this.#callbackUrl = callbackUrl;
  }

  getExchangeIdV1(): string {
    return this.#exchangeIdV1;
  }

  getExchangeIdV2(): string {
    return this.#exchangeIdV2;
  }

  getExchangeDefinitionV1(): ExchangeDefinitionDto {
    const exchangeDefinition: ExchangeDefinitionDto = {
      exchangeId: this.#exchangeIdV1,
      query: [
        {
          type: this.queryType,
          credentialQuery: [
            {
              presentationDefinition: {
                id: '286bc1e0-f1bd-488a-a873-8d71be3c690e',
                submission_requirements: [
                  {
                    name: 'Application requirements',
                    purpose: 'Application requires user satisfies certain criteries',
                    rule: Rules.All,
                    from: 'A'
                  },
                  {
                    name: 'User consent',
                    purpose: 'User should give consent',
                    rule: Rules.All,
                    from: 'B'
                  }
                ],
                input_descriptors: [
                  {
                    id: 'permanent_resident_card',
                    name: 'Permanent Resident Card',
                    group: ['A'],
                    purpose: 'We can only allow permanent residents into the application',
                    constraints: {
                      fields: [
                        {
                          path: ['$.type'],
                          filter: {
                            type: 'array',
                            contains: {
                              type: 'string',
                              const: 'PermanentResidentCard'
                            }
                          }
                        }
                      ]
                    }
                  },
                  {
                    id: 'consent_credential',
                    name: 'Consent Credential',
                    group: ['B'],
                    purpose: 'One consent credential is required for this presentation',
                    constraints: {
                      subject_is_issuer: 'required',
                      fields: [
                        {
                          path: ['$.type'],
                          filter: {
                            type: 'array',
                            contains: {
                              type: 'string',
                              const: 'ConsentCredential'
                            }
                          }
                        }
                      ]
                    }
                  }
                ]
              }
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

  getExchangeDefinitionV2(): ExchangeDefinitionDto {
    const exchangeDefinition: ExchangeDefinitionDto = {
      exchangeId: this.#exchangeIdV2,
      query: [
        {
          type: this.queryType,
          credentialQuery: [
            {
              presentationDefinition: {
                id: '286bc1e0-f1bd-488a-a873-8d71be3c690f',
                submission_requirements: [
                  {
                    name: 'Application requirements',
                    purpose: 'Application requires user satisfies certain criteries',
                    rule: Rules.Pick,
                    min: 2,
                    from: 'A'
                  }
                ],
                input_descriptors: [
                  {
                    id: 'permanent_resident_card',
                    name: 'Permanent Resident Card',
                    group: ['A'],
                    purpose: 'We can only allow permanent residents into the application',
                    constraints: {
                      fields: [
                        {
                          path: ['$.type'],
                          filter: {
                            type: 'array',
                            contains: {
                              type: 'string',
                              const: 'PermanentResidentCard'
                            }
                          }
                        }
                      ]
                    }
                  },
                  {
                    id: 'consent_credential',
                    name: 'Consent Credential',
                    group: ['A'],
                    purpose: 'One consent credential is required for this presentation',
                    constraints: {
                      subject_is_issuer: 'required',
                      fields: [
                        {
                          path: ['$.type'],
                          filter: {
                            type: 'array',
                            contains: {
                              type: 'string',
                              const: 'ConsentCredential'
                            }
                          }
                        }
                      ]
                    }
                  }
                ]
              }
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
}
