/**
 * Copyright 2021, 2022 Energy Web Foundation
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

import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { VerifiablePresentationDto } from '../credentials/dtos/verifiable-presentation.dto';
import { ExchangeEntity } from './entities/exchange.entity';
import { ExchangeResponseDto } from './dtos/exchange-response.dto';
import { VpRequestDto } from './dtos/vp-request.dto';
import { ExchangeDefinitionDto } from './dtos/exchange-definition.dto';
import { TransactionEntity } from './entities/transaction.entity';
import { ConfigService } from '@nestjs/config';
import { CallbackDto } from './dtos/callback.dto';
import { ReviewResult, SubmissionReviewDto } from './dtos/submission-review.dto';
import { VpSubmissionVerifierService } from './vp-submission-verifier.service';
import { validate } from 'class-validator';
import { API_DEFAULT_VERSION_PREFIX } from '../../setup';
import { PresentationSubmissionEntity } from './entities/presentation-submission.entity';

@Injectable()
export class ExchangeService {
  private readonly logger = new Logger(ExchangeService.name, { timestamp: true });

  constructor(
    private vpSubmissionVerifierService: VpSubmissionVerifierService,
    @InjectRepository(TransactionEntity)
    private transactionRepository: Repository<TransactionEntity>,
    @InjectRepository(ExchangeEntity)
    private exchangeRepository: Repository<ExchangeEntity>,
    private configService: ConfigService,
    private httpService: HttpService
  ) {}

  public async createExchange(exchangeDefinitionDto: ExchangeDefinitionDto): Promise<void> {
    if (await this.exchangeRepository.findOneBy({ exchangeId: exchangeDefinitionDto.exchangeId })) {
      throw new ConflictException(`exchangeId='${exchangeDefinitionDto.exchangeId}' already exists`);
    }

    const exchange = new ExchangeEntity(exchangeDefinitionDto);
    await this.exchangeRepository.save(exchange);
  }

  /**
   * Starts a credential exchange
   * @param exchangeId
   * @returns exchange response
   */
  public async startExchange(exchangeId: string): Promise<ExchangeResponseDto> {
    const exchange = await this.exchangeRepository.findOneBy({ exchangeId });

    if (!exchange) {
      throw new NotFoundException(`no exchange definition found for this exchangeId=${exchangeId}`);
    }

    const baseUrl = this.configService.get<string>('baseUrl');

    const baseWithControllerPath = `${baseUrl}${API_DEFAULT_VERSION_PREFIX}/vc-api`;
    const transaction = exchange.start(baseWithControllerPath);
    await this.transactionRepository.save(transaction);
    return {
      vpRequest: VpRequestDto.toDto(transaction.vpRequest),
      processingInProgress: false
    };
  }

  /**
   * Handle a presentation submitted to an exchange
   * TODO: add logging of errors (using structured logs?)
   * @param verifiablePresentation
   * @param transactionId
   * @returns exchange response
   */
  public async continueExchange(
    verifiablePresentation: VerifiablePresentationDto,
    transactionId: string
  ): Promise<ExchangeResponseDto> {
    const transaction = await this.getExchangeTransaction(transactionId);

    if (!transaction) {
      throw new NotFoundException(`${transactionId}: no transaction found for this transaction id`);
    }

    const { response, callback } = await transaction.processPresentation(
      verifiablePresentation,
      this.vpSubmissionVerifierService
    );

    if (response.errors.length > 0) {
      throw new BadRequestException(response.errors);
    }

    await this.transactionRepository.save(transaction);

    const body = CallbackDto.toDto({
      ...transaction,
      presentationSubmission: {
        ...transaction.presentationSubmission,
        vp: verifiablePresentation
      } as PresentationSubmissionEntity
    } as TransactionEntity);

    const validationErrors = await validate(body, {
      whitelist: true,
      forbidUnknownValues: true,
      forbidNonWhitelisted: false // here we want properties not defined in the CallbackDto to be just stripped out and not sent to a callback endpoint
    });

    if (validationErrors.length > 0) {
      this.logger.error('\n' + validationErrors.map((e) => e.toString()).join('\n\n'));
      throw new Error(validationErrors.toString());
    }

    Promise.all(
      callback?.map(async (callback) => {
        try {
          await this.httpService.axiosRef.post(callback.url, body);
          this.logger.log(`callback submitted: ${callback.url}`);
        } catch (err) {
          this.logger.error(`error calling callback (${callback.url}): ${err}`);
        }
      })
    ).catch((err) => this.logger.error(err));
    // TODO: decide how to change logic here to handle callback error

    return response;
  }

  public async getExchange(exchangeId: string): Promise<ExchangeEntity> {
    const exchange = await this.exchangeRepository.findOneBy({ exchangeId });
    return exchange;
  }

  public async getExchangeTransaction(transactionId: string): Promise<TransactionEntity> {
    const transaction = await this.transactionRepository.findOne({
      where: {
        transactionId
      },
      relations: {
        vpRequest: true,
        presentationReview: true,
        presentationSubmission: true
      }
    });

    if (!transaction) {
      return null;
    }
    const vpRequest = transaction.vpRequest;
    if (!vpRequest) {
      throw new NotFoundException(`${transactionId}: no vp-request associated this transaction id`);
    }
    if (!transaction.exchangeId) {
      throw new NotFoundException(`${transactionId}: no exchange found for this transaction id`);
    }
    return transaction;
  }

  public async addReview(transactionId: string, reviewDto: SubmissionReviewDto) {
    const transaction = await this.getExchangeTransaction(transactionId);

    if (!transaction) {
      throw new NotFoundException(`${transactionId}: no transaction found for this transaction id`);
    }

    switch (reviewDto.result) {
      case ReviewResult.approved:
        transaction.approvePresentationSubmission(reviewDto.vp);
        break;
      case ReviewResult.rejected:
        transaction.rejectPresentationSubmission();
        break;
    }
    await this.transactionRepository.save(transaction);
    return {
      errors: []
    };
  }
}
