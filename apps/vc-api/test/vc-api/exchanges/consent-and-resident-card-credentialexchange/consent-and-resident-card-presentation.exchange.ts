/*
 * Copyright 2021 - 2023 Energy Web Foundation
 * SPDX-License-Identifier: Apache-2.0
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
                    purpose: 'Application requires user satisfies certain criteria',
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
                          path: ['$.id'],
                          filter: {
                            const: 'urn:uuid:49f69fb8-f256-4b2e-b15d-c7ebec3a507e'
                          }
                        },
                        // pex 6 validates filters against the DIF PE filter schema, which
                        // does not allow free-form json-schema keywords such as "properties"
                        // or "$ref"; reach into the context and subject with json paths instead
                        {
                          path: ["$['@context'][0]"],
                          filter: {
                            const: 'https://www.w3.org/2018/credentials/v1'
                          }
                        },
                        {
                          path: ["$['@context'][1].elia"],
                          filter: {
                            const: 'https://www.eliagroup.eu/ld-context-2022#'
                          }
                        },
                        {
                          path: ["$['@context'][1].consent"],
                          filter: {
                            const: 'elia:consent'
                          }
                        },
                        {
                          path: ['$.credentialSubject.consent'],
                          filter: {
                            const: 'I consent to such and such'
                          }
                        },
                        {
                          path: ['$.type'],
                          filter: {
                            type: 'array',
                            items: [
                              {
                                const: 'VerifiableCredential'
                              }
                            ]
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
                    purpose: 'Application requires user satisfies certain criteria',
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
                          path: ['$.id'],
                          filter: {
                            const: 'urn:uuid:49f69fb8-f256-4b2e-b15d-c7ebec3a507e'
                          }
                        },
                        // pex 6 validates filters against the DIF PE filter schema, which
                        // does not allow free-form json-schema keywords such as "properties"
                        // or "$ref"; reach into the context and subject with json paths instead
                        {
                          path: ["$['@context'][0]"],
                          filter: {
                            const: 'https://www.w3.org/2018/credentials/v1'
                          }
                        },
                        {
                          path: ["$['@context'][1].elia"],
                          filter: {
                            const: 'https://www.eliagroup.eu/ld-context-2022#'
                          }
                        },
                        {
                          path: ["$['@context'][1].consent"],
                          filter: {
                            const: 'elia:consent'
                          }
                        },
                        {
                          path: ['$.credentialSubject.consent'],
                          filter: {
                            const: 'I consent to such and such'
                          }
                        },
                        {
                          path: ['$.type'],
                          filter: {
                            type: 'array',
                            items: [
                              {
                                const: 'VerifiableCredential'
                              }
                            ]
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
