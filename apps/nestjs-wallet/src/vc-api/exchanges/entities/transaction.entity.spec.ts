import { ExchangeResponseDto } from '../dtos/exchange-response.dto';
import { VerifiablePresentation } from '../types/verifiable-presentation';
import { VpRequestInteractServiceType } from '../types/vp-request-interact-service-type';
import { VpRequestQuery } from '../types/vp-request-query';
import { VpRequestQueryType } from '../types/vp-request-query-type';
import { TransactionEntity } from './transaction.entity';
import { VpRequestEntity } from './vp-request.entity';

describe('TransactionEntity', () => {
  const challenge = 'a9511bdb-5577-4d2f-95e3-e819fe5d3c33';
  beforeEach(async () => {});

  afterEach(async () => {
    jest.resetAllMocks();
  });

  describe('processPresentation', () => {
    it('should return result upon successful verification of UnMediatedPresentation', async () => {
      const vp = {
        '@context': [],
        type: [],
        verifiableCredential: [],
        proof: {
          challenge
        }
      };
      const vpRequest: VpRequestEntity = {
        challenge,
        query: [],
        interact: {
          service: [
            {
              type: VpRequestInteractServiceType.unmediatedPresentation,
              serviceEndpoint: 'https://endpoint.com'
            }
          ]
        }
      };
      const callback_1 = 'https://my-callback.com';
      const configuredCallback = [{ url: callback_1 }];
      const exchangeId = 'my-exchange';
      const transactionId = '9ec5686e-6381-41c4-9286-3c93cdefac53';
      const transaction = new TransactionEntity(transactionId, exchangeId, vpRequest, configuredCallback);
      const { callback, response } = transaction.processPresentation(vp);
      expect(callback).toHaveLength(1);
      expect(callback[0].url).toEqual(callback_1);
      expect(response.errors).toHaveLength(0);
      expect(response.vpRequest).toBeUndefined();
      expect(response.vp).toBeUndefined();
    });
  });

  describe('validate presentation', () => {
    function getResponse(query: VpRequestQuery[], vp: VerifiablePresentation): ExchangeResponseDto {
      const vpRequest: VpRequestEntity = {
        challenge,
        query,
        interact: {
          service: [
            {
              type: VpRequestInteractServiceType.unmediatedPresentation,
              serviceEndpoint: 'https://endpoint.com'
            }
          ]
        }
      };
      const configuredCallback = [];
      const exchangeId = 'my-exchange';
      const transactionId = '9ec5686e-6381-41c4-9286-3c93cdefac53';
      const transaction = new TransactionEntity(transactionId, exchangeId, vpRequest, configuredCallback);
      const { response } = transaction.processPresentation(vp);
      return response;
    }

    it('should throw an error when the challenge does not match', async () => {
      const vp = {
        '@context': [],
        type: [],
        verifiableCredential: [],
        proof: {
          challenge: 'a9511bdb-5577-4d2f-95e3-e34efsdfsdfsd'
        }
      };
      const query = [
        {
          type: VpRequestQueryType.didAuth,
          credentialQuery: undefined
        }
      ];

      const response = getResponse(query, vp);
      expect(response.errors.length).toBeGreaterThan(0);
      expect(response.errors).toContain('Challenge does not match');
    });

    describe('didAuth request type', () => {
      it('should throw an error when presentation holder is empty', async () => {
        const vp = {
          '@context': [],
          type: [],
          verifiableCredential: [],
          proof: {
            challenge
          }
        };
        const query = [
          {
            type: VpRequestQueryType.didAuth,
            credentialQuery: undefined
          }
        ];

        const response = getResponse(query, vp);
        expect(response.errors.length).toBeGreaterThan(0);
        expect(response.errors).toContain('Presentation holder is required for didAuth query');
      });
    });

    describe('presentationDefinition request type', () => {
      it('should throw an error when presentation not meet request requirements', async () => {
        const vp = {
          '@context': [],
          type: [],
          verifiableCredential: [
            {
              '@context': [
                'https://www.w3.org/2018/credentials/v1',
                {
                  issuerFields: {
                    '@id': 'ew:issuerFields',
                    '@type': 'ew:IssuerFields'
                  },
                  namespace: 'ew:namespace',
                  role: {
                    '@id': 'ew:role',
                    '@type': 'ew:Role'
                  },
                  ew: 'https://energyweb.org/ld-context-2022#',
                  version: 'ew:version',
                  EWFRole: 'ew:EWFRole'
                }
              ],
              id: 'urn:uuid:7f94d397-3e70-4a43-945e-1a13069e636f',
              type: ['VerifiableCredential', 'EWFRole'],
              credentialSubject: {
                id: 'did:example:1234567894ad31s12',
                issuerFields: [],
                role: {
                  namespace: 'test.iam.ewc',
                  version: '1'
                }
              },
              issuer: 'did:example:123456789af312312i',
              issuanceDate: '2022-03-18T08:57:32.477Z'
            }
          ],
          proof: {
            challenge
          }
        };
        const query = [
          {
            type: VpRequestQueryType.presentationDefinition,
            credentialQuery: [
              {
                presentationDefinition: {
                  id: '286bc1e0-f1bd-488a-a873-8d71be3c690e',
                  input_descriptors: [
                    {
                      id: 'some_id',
                      name: 'Required credential',
                      constraints: {
                        fields: [
                          {
                            path: ['$.credentialSubject.role.namespace'],
                            filter: {
                              type: 'string',
                              const: 'customer.roles.rebeam.apps.eliagroup.iam.ewc'
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
        ];

        const response = getResponse(query, vp as any);
        expect(response.errors.length).toBeGreaterThan(0);
        expect(response.errors).toContainEqual(
          expect.stringContaining('Presentation definition (1) validation failed')
        );
      });

      it('should throw an error when credential is missing issuer fields', async () => {
        const vp = {
          '@context': [],
          type: [],
          verifiableCredential: [
            {
              '@context': [
                'https://www.w3.org/2018/credentials/v1',
                {
                  issuerFields: {
                    '@id': 'ew:issuerFields',
                    '@type': 'ew:IssuerFields'
                  },
                  namespace: 'ew:namespace',
                  role: {
                    '@id': 'ew:role',
                    '@type': 'ew:Role'
                  },
                  ew: 'https://energyweb.org/ld-context-2022#',
                  version: 'ew:version',
                  EWFRole: 'ew:EWFRole'
                }
              ],
              id: 'urn:uuid:7f94d397-3e70-4a43-945e-1a13069e636f',
              type: ['VerifiableCredential', 'EWFRole'],
              credentialSubject: {
                id: 'did:example:1234567894ad31s12',
                issuerFields: [{ key: 'foo', value: 'bar' }],
                role: {
                  namespace: 'customer.roles.rebeam.apps.eliagroup.iam.ewc',
                  version: '1'
                }
              },
              issuer: 'did:example:123456789af312312i',
              issuanceDate: '2022-03-18T08:57:32.477Z'
            }
          ],
          proof: {
            challenge
          }
        };
        const query = [
          {
            type: VpRequestQueryType.presentationDefinition,
            credentialQuery: [
              {
                presentationDefinition: {
                  id: '286bc1e0-f1bd-488a-a873-8d71be3c690e',
                  input_descriptors: [
                    {
                      id: 'some_id_3',
                      name: 'Required credential issuer fields',
                      constraints: {
                        fields: [
                          {
                            path: ['$.credentialSubject.issuerFields[*].key'],
                            filter: {
                              type: 'string',
                              const: 'bar'
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
        ];

        const response = getResponse(query, vp as any);
        expect(response.errors.length).toBeGreaterThan(0);
        expect(response.errors).toContainEqual(
          expect.stringContaining('Presentation definition (1) validation failed')
        );
      });

      it('should success when presentation meet request requirements', async () => {
        const vp = {
          '@context': [],
          type: [],
          verifiableCredential: [
            {
              '@context': [
                'https://www.w3.org/2018/credentials/v1',
                {
                  issuerFields: {
                    '@id': 'ew:issuerFields',
                    '@type': 'ew:IssuerFields'
                  },
                  namespace: 'ew:namespace',
                  role: {
                    '@id': 'ew:role',
                    '@type': 'ew:Role'
                  },
                  ew: 'https://energyweb.org/ld-context-2022#',
                  version: 'ew:version',
                  EWFRole: 'ew:EWFRole'
                }
              ],
              id: 'urn:uuid:7f94d397-3e70-4a43-945e-1a13069e636f',
              type: ['VerifiableCredential', 'EWFRole'],
              credentialSubject: {
                id: 'did:example:1234567894ad31s12',
                issuerFields: [
                  { key: 'foo', value: 'bar' },
                  { key: 'bar', value: 'foo' }
                ],
                role: {
                  namespace: 'customer.roles.rebeam.apps.eliagroup.iam.ewc',
                  version: '1'
                }
              },
              issuer: 'did:example:123456789af312312i',
              issuanceDate: '2022-03-18T08:57:32.477Z'
            }
          ],
          proof: {
            challenge
          }
        };
        const query = [
          {
            type: VpRequestQueryType.presentationDefinition,
            credentialQuery: [
              {
                presentationDefinition: {
                  id: '286bc1e0-f1bd-488a-a873-8d71be3c690e',
                  input_descriptors: [
                    {
                      id: 'some_id',
                      name: 'Required credential',
                      constraints: {
                        fields: [
                          {
                            path: ['$.credentialSubject.role.namespace'],
                            filter: {
                              type: 'string',
                              const: 'customer.roles.rebeam.apps.eliagroup.iam.ewc'
                            }
                          }
                        ]
                      }
                    }
                  ]
                }
              },
              {
                presentationDefinition: {
                  id: '286bc1e0-f1bd-488a-a873-8d71be3c690e',
                  input_descriptors: [
                    {
                      id: 'some_id_2',
                      name: 'Required credential version',
                      constraints: {
                        fields: [
                          {
                            path: ['$.credentialSubject.role.version'],
                            filter: {
                              type: 'string',
                              const: '1'
                            }
                          }
                        ]
                      }
                    }
                  ]
                }
              },
              {
                presentationDefinition: {
                  id: '286bc1e0-f1bd-488a-a873-8d71be3c690e',
                  input_descriptors: [
                    {
                      id: 'some_id_3',
                      name: 'Required credential issuer fields',
                      constraints: {
                        fields: [
                          {
                            path: ['$.credentialSubject.issuerFields[*].key'],
                            filter: {
                              type: 'string',
                              const: 'foo'
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
        ];

        const response = getResponse(query, vp as any);
        expect(response.errors).toHaveLength(0);
      });
    });
  });
});
