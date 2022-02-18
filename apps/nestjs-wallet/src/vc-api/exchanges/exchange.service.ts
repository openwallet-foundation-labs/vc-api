import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { VcApiService } from '../vc-api.service';
import { VpRequestEntity } from './entities/vp-request.entity';
import { VerifiablePresentationDto } from '../dtos/verifiable-presentation.dto';
import { ExchangeExecutionEntity } from './entities/exchange-execution.entity';
import { ExchangeResponseDto } from './dtos/exchange-response.dto';
import { VpRequestDto } from './dtos/vp-request.dto';
import { AckStatus } from './types/ack-status';
import { ExchangeDefinitionDto } from './dtos/exchange-definition.dto';
import { VpRequestInteractServiceType } from './types/vp-request-interact-service-type';
import { ExchangeTransactionEntity } from './entities/exchange-transaction.entity';

@Injectable()
export class ExchangeService {
  #exchangeDefinitions: Record<string, ExchangeDefinitionDto> = {};

  constructor(
    private vcApiService: VcApiService,
    @InjectRepository(VpRequestEntity)
    private vpRequestRepository: Repository<VpRequestEntity>,
    @InjectRepository(ExchangeTransactionEntity)
    private exchangeTransactionRespository: Repository<ExchangeTransactionEntity>,
    @InjectRepository(ExchangeExecutionEntity)
    private exchangeExecutionRepository: Repository<ExchangeExecutionEntity>
  ) {}

  public async configureWorkflow(exchangeDefinitionDto: ExchangeDefinitionDto) {
    this.#exchangeDefinitions[exchangeDefinitionDto.exchangeId] = exchangeDefinitionDto;
  }

  /**
   * Starts an exchange to obtain a credential
   * @param exchangeId
   * @returns exchange response
   */
  public async startExchange(exchangeId: string): Promise<ExchangeResponseDto> {
    const exchangeDefinition = this.#exchangeDefinitions[exchangeId];
    if (!exchangeDefinition) {
      return {
        errors: [`${exchangeId}: no exchange definition found for this exchangeId`],
        ack: { status: AckStatus.fail }
      };
    }
    const executionId = uuidv4();
    const transactionId = uuidv4();
    const challenge = uuidv4();
    const interactServices = exchangeDefinition.interactServices.map((serviceDef) => {
      if (serviceDef.type === VpRequestInteractServiceType.unmediatedPresentation) {
        return {
          type: VpRequestInteractServiceType.unmediatedPresentation,
          serviceEndpoint: `${serviceDef.baseUrl}/exchanges/${exchangeId}/${transactionId}`
        };
      }
    });
    const vpRequest = this.vpRequestRepository.create({
      challenge,
      query: exchangeDefinition.query,
      interact: {
        service: interactServices
      }
    });
    await this.vpRequestRepository.save(vpRequest);
    const exchangeTransaction = this.exchangeTransactionRespository.create({
      transactionId: transactionId,
      vpRequest
    });
    const exchangeExecution = this.exchangeExecutionRepository.create({
      exchangeId,
      executionId,
      transactions: [exchangeTransaction]
    });
    await this.exchangeExecutionRepository.save(exchangeExecution);
    return { errors: [], vpRequest: VpRequestDto.toDto(vpRequest), ack: { status: AckStatus.pending } };
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
    const exchangeTransaction = await this.exchangeTransactionRespository.findOne(transactionId, {
      relations: ['vpRequest', 'execution']
    });
    if (!exchangeTransaction) {
      return {
        errors: [`${transactionId}: no exchange transaction found for this transactionId`],
        ack: { status: AckStatus.fail }
      };
    }
    const exchangeDefinition = this.#exchangeDefinitions[exchangeTransaction.execution.exchangeId];
    if (!exchangeDefinition) {
      return {
        errors: [`${transactionId}: no exchange definition found for this exchangeId`],
        ack: { status: AckStatus.fail }
      };
    }
    const vpRequest = exchangeTransaction.vpRequest;
    if (!vpRequest) {
      return {
        errors: [`${transactionId}: no vp-request associated this flowId`],
        ack: { status: AckStatus.fail }
      };
    }
    const result = await this.vcApiService.verifyPresentation(verifiablePresentation, {
      challenge: vpRequest.challenge
    });
    if (!result.checks.includes('proof')) {
      return {
        errors: [`${transactionId}: verification of presentation proof not successful`],
        ack: { status: AckStatus.fail }
      };
    }
    return {
      errors: [],
      ack: { status: AckStatus.ok }
    };
  }

  public async getExchangeTransaction(
    transactionId: string
  ): Promise<{ errors: string[]; exchangeTransaction?: ExchangeTransactionEntity }> {
    const exchangeTransaction = await this.exchangeTransactionRespository.findOne(transactionId, {
      relations: ['execution', 'vpRequest']
    });
    if (!exchangeTransaction) {
      return { errors: [`${transactionId}: no exchange transaction found for this transaction id`] };
    }
    if (!exchangeTransaction.execution) {
      return { errors: [`${transactionId}: no exchange execution found for this transaction id`] };
    }
    return { errors: [], exchangeTransaction };
  }
}
