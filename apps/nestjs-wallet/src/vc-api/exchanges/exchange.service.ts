import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PEX, Status } from '@sphereon/pex';
import { Repository } from 'typeorm';
import { VcApiService } from '../vc-api.service';
import { VerifiablePresentationDto } from '../dtos/verifiable-presentation.dto';
import { ExchangeEntity } from './entities/exchange.entity';
import { ExchangeResponseDto } from './dtos/exchange-response.dto';
import { VpRequestDto } from './dtos/vp-request.dto';
import { ExchangeDefinitionDto } from './dtos/exchange-definition.dto';
import { TransactionEntity } from './entities/transaction.entity';
import { VpRequestQueryType } from './types/vp-request-query-type';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ExchangeService {
  #pex: PEX;

  constructor(
    private vcApiService: VcApiService,
    @InjectRepository(TransactionEntity)
    private transactionRepository: Repository<TransactionEntity>,
    @InjectRepository(ExchangeEntity)
    private exchangeRepository: Repository<ExchangeEntity>,
    private configService: ConfigService
  ) {
    this.#pex = new PEX();
  }

  public async createExchange(exchangeDefinitionDto: ExchangeDefinitionDto) {
    // Validate the queries. This should be done in a custom DTO validator
    exchangeDefinitionDto.query.forEach((query) => {
      if (query.type === VpRequestQueryType.presentationDefinition) {
        query.credentialQuery.forEach((credentialQuery) => {
          const validated = this.#pex.validateDefinition(credentialQuery);
          if (Array.isArray(validated)) {
            validated.forEach((checked) => {
              if (checked.status === Status.ERROR || checked.status === Status.WARN) {
                return {
                  errors: ['an error from validated']
                };
              }
            });
          } else {
            if (validated.status === Status.ERROR || validated.status === Status.WARN) {
              return {
                errors: ['an error from validated']
              };
            }
          }
        });
      }
    });

    // Persist the exchange
    const exchange = this.exchangeRepository.create({
      exchangeId: exchangeDefinitionDto.exchangeId,
      query: exchangeDefinitionDto.query,
      interactServiceDefinitions: exchangeDefinitionDto.interactServices,
      isOneTime: exchangeDefinitionDto.isOneTime
    });
    await this.exchangeRepository.save(exchange);
    return {
      errors: []
    };
  }

  /**
   * Starts a credential exchange
   * @param exchangeId
   * @returns exchange response
   */
  public async startExchange(exchangeId: string): Promise<ExchangeResponseDto> {
    const exchange = await this.exchangeRepository.findOne(exchangeId);
    if (!exchange) {
      return {
        errors: [`${exchangeId}: no exchange definition found for this exchangeId`]
      };
    }
    const baseUrl = this.configService.get<string>('baseUrl');
    if (!baseUrl) {
      return {
        errors: [`base url is not defined`]
      };
    }
    const baseWithControllerPath = `${baseUrl}/vc-api`;
    const transaction = exchange.start(baseWithControllerPath);
    // TODO: considering saving as a transaction
    await this.exchangeRepository.save(exchange);
    await this.transactionRepository.save(transaction);
    return {
      errors: [],
      vpRequest: VpRequestDto.toDto(transaction.vpRequest)
    };
  }

  /**
   * Handle a presentation submitted to an exchange
   * TODO: add logging of errors (using structured logs?)
   * @param verifiablePresentation
   * @param transactionId
   * @returns exchange response
   */
  public async handlePresentation(
    verifiablePresentation: VerifiablePresentationDto,
    transactionId: string,
    exchangeId: string
  ): Promise<ExchangeResponseDto> {
    const transactionQuery = await this.getExchangeTransaction(transactionId);
    if (transactionQuery.errors.length > 0 || !transactionQuery.transaction) {
      return {
        errors: transactionQuery.errors
      };
    }
    const transaction = transactionQuery.transaction;
    const vpRequest = transaction.vpRequest;
    const result = await this.vcApiService.verifyPresentation(verifiablePresentation, {
      challenge: vpRequest.challenge
    });
    if (!result.checks.includes('proof')) {
      return {
        errors: [`${transactionId}: verification of presentation proof not successful`]
      };
    }
    const response = transaction.processPresentation(verifiablePresentation);
    await this.transactionRepository.save(transaction);
    return response;
  }

  public async getExchange(exchangeId: string): Promise<{ errors: string[]; exchange?: ExchangeEntity }> {
    const exchange = await this.exchangeRepository.findOne(exchangeId);
    if (!exchange) {
      return { errors: [`${exchangeId}: no exchange found for this transaction id`] };
    }
    return { errors: [], exchange: exchange };
  }

  public async getExchangeTransaction(
    transactionId: string
  ): Promise<{ errors: string[]; transaction?: TransactionEntity }> {
    const transaction = await this.transactionRepository.findOne(transactionId, {
      relations: ['vpRequest', 'presentationReview']
    });
    if (!transaction) {
      return { errors: [`${transactionId}: no transaction found for this transaction id`] };
    }
    const vpRequest = transaction.vpRequest;
    if (!vpRequest) {
      return {
        errors: [`${transactionId}: no vp-request associated this transaction id`]
      };
    }
    if (!transaction.exchangeId) {
      return { errors: [`${transactionId}: no exchange found for this transaction id`] };
    }
    return { errors: [], transaction: transaction };
  }
}
