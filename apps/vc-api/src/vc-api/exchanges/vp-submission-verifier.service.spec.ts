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

import { Test, TestingModule } from '@nestjs/testing';
import { CredentialsService } from '../credentials/credentials.service';
import { VerificationResult } from '../credentials/types/verification-result';
import { VpRequestEntity } from './entities/vp-request.entity';
import { VerifiablePresentation } from './types/verifiable-presentation';
import { VpRequestQuery } from './types/vp-request-query';
import { VpRequestQueryType } from './types/vp-request-query-type';
import { VpSubmissionVerifierService } from './vp-submission-verifier.service';

const presentationVerificationResult = {
  checks: ['proof'],
  warnings: [],
  errors: []
};

const mockCredentialService = {
  verifyPresentation: jest.fn().mockResolvedValue(presentationVerificationResult)
};

describe('VpSubmissionVerifierService', () => {
  const challenge = 'a9511bdb-5577-4d2f-95e3-e819fe5d3c33';
  let service: VpSubmissionVerifierService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VpSubmissionVerifierService,
        {
          provide: CredentialsService,
          useValue: mockCredentialService
        }
      ]
    }).compile();

    service = module.get<VpSubmissionVerifierService>(VpSubmissionVerifierService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('verifyVpRequestSubmission', () => {
    async function getVerificationResult(
      query: VpRequestQuery[],
      vp: VerifiablePresentation
    ): Promise<VerificationResult> {
      const vpRequest: VpRequestEntity = {
        challenge,
        query,
        interact: {
          service: []
        }
      };
      return await service.verifyVpRequestSubmission(vp, vpRequest);
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

      const response = await getVerificationResult(query, vp);
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

        const response = await getVerificationResult(query, vp);
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

        const response = await getVerificationResult(query, vp as any);
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

        const response = await getVerificationResult(query, vp as any);
        expect(response.errors.length).toBeGreaterThan(0);
        expect(response.errors).toContainEqual(
          expect.stringContaining('Presentation definition (1) validation failed')
        );
      });

      describe('when subject_is_issuer is set to "required"', function () {
        const query = [
          {
            type: VpRequestQueryType.presentationDefinition,
            credentialQuery: [
              {
                presentationDefinition: {
                  id: '286bc1e0-f1bd-488a-a873-8d71be3c690e',
                  input_descriptors: [
                    {
                      id: 'consent_agreement',
                      name: 'Consent Agreement',
                      constraints: {
                        subject_is_issuer: 'required',
                        fields: [
                          {
                            path: ['$.credentialSubject'],
                            filter: {
                              type: 'object',
                              properties: {
                                consent: {
                                  const: 'I consent to such and such'
                                }
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
        ];

        it('should throw an error when subject is not equal to the issuer', async function () {
          const vp = {
            '@context': [],
            type: [],
            verifiableCredential: [
              {
                '@context': ['https://www.w3.org/2018/credentials/v1'],
                id: 'urn:uuid:7f94d397-3e70-4a43-945e-1a13069e636f',
                type: ['VerifiableCredential', 'EWFRole'],
                credentialSubject: {
                  id: 'did:example:00000000000000001'
                },
                issuer: 'did:example:00000000000000002',
                issuanceDate: '2022-03-18T08:57:32.477Z'
              }
            ],
            proof: {
              challenge
            }
          };

          const response = await getVerificationResult(query, vp as any);
          expect(response.errors).toEqual([
            'Presentation definition (1) validation failed, reason: subject is not issuer: $.input_descriptors[0]: $.verifiableCredential[0]',
            'Presentation definition (1) validation failed, reason: The input candidate is not eligible for submission: $.input_descriptors[0]: $.verifiableCredential[0]'
          ]);
        });

        it('should succeed when subject is equal to the issuer', async function () {
          const vp = {
            '@context': [],
            type: [],
            verifiableCredential: [
              {
                '@context': ['https://www.w3.org/2018/credentials/v1'],
                id: 'urn:uuid:7f94d397-3e70-4a43-945e-1a13069e636f',
                type: ['VerifiableCredential', 'EWFRole'],
                credentialSubject: {
                  id: 'did:example:00000000000000001'
                },
                issuer: 'did:example:00000000000000001',
                issuanceDate: '2022-03-18T08:57:32.477Z'
              }
            ],
            proof: {
              challenge
            }
          };

          const response = await getVerificationResult(query, vp as any);
          expect(response.errors).toEqual([]);
        });
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

        const response = await getVerificationResult(query, vp as any);
        expect(response.errors).toHaveLength(0);
      });
    });
  });
});
