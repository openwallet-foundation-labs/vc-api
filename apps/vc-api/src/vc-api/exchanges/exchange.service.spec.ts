/*
 * Copyright 2021 - 2023 Energy Web Foundation
 * SPDX-License-Identifier: Apache-2.0
 */

import { Test, TestingModule } from '@nestjs/testing';
import { HttpService } from '@nestjs/axios';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ExchangeEntity } from './entities/exchange.entity';
import { ExchangeService } from './exchange.service';
import { ExchangeDefinitionDto } from './dtos/exchange-definition.dto';
import { VpRequestInteractServiceType } from './types/vp-request-interact-service-type';
import { TransactionEntity } from './entities/transaction.entity';
import { VpRequestQueryType } from './types/vp-request-query-type';
import { ConfigService } from '@nestjs/config';
import { ReviewResult, SubmissionReviewDto } from './dtos/submission-review.dto';
import { VpSubmissionVerifierService } from './vp-submission-verifier.service';
import { SubmissionVerifier } from './types/submission-verifier';
import { BadRequestException } from '@nestjs/common';

const baseUrl = 'https://test-exchange.com';
const exchangeId = 'test-exchange';
const vp = {
  '@context': ['https://www.w3.org/2018/credentials/v1', 'https://www.w3.org/2018/credentials/examples/v1'],
  type: ['VerifiablePresentation'],
  verifiableCredential: [],
  holder: 'did:key:z6MksBH4LMy8SoYFUNjDXtQ2Rq4dHnyuemowxXqzLpuB6nvc',
  proof: {}
};

const submissionVerificationResult = {
  checks: ['proof'],
  warnings: [],
  errors: []
};

const mockSubmissionVerifier: SubmissionVerifier = {
  verifyVpRequestSubmission: jest.fn()
};

describe('ExchangeService', () => {
  let service: ExchangeService;

  // https://stackoverflow.com/a/55366343
  let transaction: TransactionEntity;
  const transactionRepositoryMockFactory = jest.fn(() => ({
    findOne: jest.fn(() => transaction),
    findOneBy: jest.fn(() => transaction),
    save: jest.fn((entity) => {
      transaction = entity;
      return entity;
    })
  }));

  const exchangeRepositoryMockFactory = jest.fn(() => {
    let exchange: ExchangeEntity;

    return {
      findOne: jest.fn(() => exchange),
      findOneBy: jest.fn(() => exchange),
      save: jest.fn((entity: ExchangeEntity) => {
        exchange = entity;
        return entity;
      })
    };
  });

  const mockHttpService = {
    axiosRef: {
      post: jest.fn()
    }
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExchangeService,
        {
          provide: VpSubmissionVerifierService,
          useValue: mockSubmissionVerifier
        },
        {
          provide: HttpService,
          useValue: mockHttpService
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn(() => {
              return baseUrl;
            })
          }
        },
        { provide: getRepositoryToken(TransactionEntity), useFactory: transactionRepositoryMockFactory },
        { provide: getRepositoryToken(ExchangeEntity), useFactory: exchangeRepositoryMockFactory }
      ]
    }).compile();

    jest
      .spyOn(mockSubmissionVerifier, 'verifyVpRequestSubmission')
      .mockResolvedValue(submissionVerificationResult);

    service = module.get<ExchangeService>(ExchangeService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createExchange', () => {
    it('should accept a presentation definition in an exchange definition', async () => {
      const presentationDefinition = {
        id: '57ca126c-acbf-4da4-8f79-447150e93128',
        input_descriptors: [
          {
            id: 'permanent_resident_card',
            name: 'Permanent Resident Card',
            purpose: 'We can only allow permanent residents into the application'
          }
        ]
      };
      const exchangeDef = {
        exchangeId: 'permanent-resident-card-presentation',
        query: [
          {
            type: VpRequestQueryType.presentationDefinition,
            credentialQuery: [{ presentationDefinition }]
          }
        ],
        interactServices: [
          {
            type: VpRequestInteractServiceType.unmediatedPresentation,
            baseUrl: 'https://example.org/'
          }
        ],
        isOneTime: false,
        callback: []
      };

      await service.createExchange(exchangeDef);
    });
  });

  describe('startExchange', () => {
    it('should start exchange from an exchange definition', async () => {
      const exchangeId = 'test-exchange';
      const exchangeDef: ExchangeDefinitionDto = {
        exchangeId: exchangeId,
        interactServices: [
          {
            type: VpRequestInteractServiceType.unmediatedPresentation
          }
        ],
        query: [],
        isOneTime: false,
        callback: []
      };
      await service.createExchange(exchangeDef);
      const exchangeResponse = await service.startExchange(exchangeId);
      expect(exchangeResponse.vpRequest.interact.service).toHaveLength(1);
      expect(exchangeResponse.vpRequest.interact.service[0].serviceEndpoint).toContain(baseUrl);
    });
  });

  describe('continueExchange', () => {
    let exchangeResponse;
    let transactionId;
    let actualCallbackUrl: string;
    let actualCallbackBody: Record<string, unknown>;

    beforeEach(async function () {
      const exchangeDef: ExchangeDefinitionDto = {
        exchangeId: exchangeId,
        interactServices: [
          {
            type: VpRequestInteractServiceType.unmediatedPresentation
          }
        ],
        query: [],
        isOneTime: false,
        callback: [
          {
            url: 'http://example.com'
          }
        ]
      };

      mockHttpService.axiosRef.post.mockClear();

      await service.createExchange(exchangeDef);
      exchangeResponse = await service.startExchange(exchangeId);
      transactionId = exchangeResponse.vpRequest.interact.service[0].serviceEndpoint.split('/').pop();
    });

    describe('when no VP submission verification errors', function () {
      beforeEach(async function () {
        await service.continueExchange(vp, transactionId);

        [actualCallbackUrl, actualCallbackBody] = mockHttpService.axiosRef.post.mock.calls[0] as unknown as [
          string,
          Record<string, unknown>
        ];
      });

      it('should send callback request', async () => {
        expect(mockHttpService.axiosRef.post.mock.calls).toHaveLength(1);
      });

      it('should send callback request to a correct url', async () => {
        expect(actualCallbackUrl).toBe('http://example.com');
      });

      describe('and callback request body', function () {
        it('should contain expected properties', async function () {
          expect(Object.keys(actualCallbackBody)).toEqual([
            'transactionId',
            'exchangeId',
            'vpRequest',
            'presentationSubmission'
          ]);
        });

        it('should contain correct exchangeId', async function () {
          expect(actualCallbackBody.exchangeId).toBe('test-exchange');
        });

        it('should contain correct transactionId', async function () {
          expect(actualCallbackBody.transactionId).toBe(transactionId);
        });

        describe('and presentationSubmission', function () {
          let presentationSubmission;

          beforeEach(async function () {
            presentationSubmission = actualCallbackBody.presentationSubmission;
          });

          it('should contain expected properties', async function () {
            expect(Object.keys(presentationSubmission).sort()).toEqual(['verificationResult', 'vp'].sort());
          });

          it('should contain correct verificationResult', async function () {
            expect(presentationSubmission.verificationResult).toEqual({
              checks: ['proof'],
              errors: [],
              warnings: []
            });
          });

          it('should contain correct vp', async function () {
            expect(presentationSubmission.vp).toEqual(vp);
          });
        });

        describe('and vpRequest', function () {
          let vpRequest;

          beforeEach(async function () {
            vpRequest = actualCallbackBody.vpRequest;
          });

          it('should contain expected properties', async function () {
            expect(Object.keys(vpRequest).sort()).toEqual(['challenge', 'interact', 'query'].sort());
          });

          it('should contain correct challenge property', async function () {
            expect(vpRequest.challenge).toBe(exchangeResponse.vpRequest.challenge);
          });

          it('should contain correct interact property', async function () {
            expect(vpRequest.interact).toEqual({
              service: [
                {
                  serviceEndpoint: exchangeResponse.vpRequest.interact.service[0].serviceEndpoint,
                  type: 'UnmediatedHttpPresentationService2021'
                }
              ]
            });
          });

          it('should contain correct query property', async function () {
            expect(vpRequest.query).toEqual([]);
          });
        });
      });
    });

    describe('when unsuccessful VP submission', function () {
      let exceptionThrown: Error;

      beforeEach(async function () {
        jest.spyOn(mockSubmissionVerifier, 'verifyVpRequestSubmission').mockResolvedValue({
          checks: [],
          warnings: [],
          errors: ['error 1', 'error 2', 'error 3']
        });

        try {
          await service.continueExchange(vp, transactionId);
        } catch (err) {
          exceptionThrown = err;
        }
      });

      it('should throw exception', async function () {
        expect(exceptionThrown).toBeDefined();
      });

      describe('and exception thrown', function () {
        it('should be a BadRequestException', async function () {
          expect(exceptionThrown).toBeInstanceOf(BadRequestException);
        });

        it('should contain errors details', async function () {
          expect(exceptionThrown['response'].message).toEqual(['error 1', 'error 2', 'error 3']);
        });
      });

      it('should make no callback requests', async function () {
        expect(mockHttpService.axiosRef.post.mock.calls.length).toBe(0);
      });
    });
  });

  describe('addReview', () => {
    it.each([[ReviewResult.approved], [ReviewResult.rejected]])(
      'should set %s result',
      async (reviewResult: ReviewResult) => {
        const exchangeDef: ExchangeDefinitionDto = {
          exchangeId: exchangeId,
          interactServices: [
            {
              type: VpRequestInteractServiceType.mediatedPresentation
            }
          ],
          query: [],
          isOneTime: true,
          callback: []
        };
        await service.createExchange(exchangeDef);
        const exchangeResponse = await service.startExchange(exchangeId);
        const transactionId = exchangeResponse.vpRequest.interact.service[0].serviceEndpoint.split('/').pop();
        await service.continueExchange(vp, transactionId);

        const reviewDto: SubmissionReviewDto = {
          result: reviewResult
        };
        const result = await service.addReview(transactionId, reviewDto);
        expect(transaction.presentationReview.reviewStatus).toEqual(reviewResult);
        expect(transaction.presentationReview.VP).toBeUndefined();
        expect(result.errors).toHaveLength(0);
      }
    );
  });
});
