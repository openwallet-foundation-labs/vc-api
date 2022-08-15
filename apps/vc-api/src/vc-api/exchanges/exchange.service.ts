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

import { ConflictException, Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { inspect } from 'util';
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

  public async createExchange(exchangeDefinitionDto: ExchangeDefinitionDto) {
    if (await this.exchangeRepository.findOneBy({ exchangeId: exchangeDefinitionDto.exchangeId })) {
      throw new ConflictException(`exchangeId='${exchangeDefinitionDto.exchangeId}' already exists`);
    }

    const exchange = new ExchangeEntity(exchangeDefinitionDto);
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
    const exchange = await this.exchangeRepository.findOneBy({ exchangeId });
    if (!exchange) {
      return {
        errors: [`${exchangeId}: no exchange definition found for this exchangeId`],
        processingInProgress: false
      };
    }
    const baseUrl = this.configService.get<string>('baseUrl');
    if (!baseUrl) {
      return {
        errors: [`base url is not defined`],
        processingInProgress: false
      };
    }
    const baseWithControllerPath = `${baseUrl}${API_DEFAULT_VERSION_PREFIX}/vc-api`;
    const transaction = exchange.start(baseWithControllerPath);
    await this.transactionRepository.save(transaction);
    return {
      errors: [],
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
    const transactionQuery = await this.getExchangeTransaction(transactionId);
    if (transactionQuery.errors.length > 0 || !transactionQuery.transaction) {
      return {
        errors: transactionQuery.errors,
        processingInProgress: false
      };
    }
    const transaction = transactionQuery.transaction;

    const { response, callback } = await transaction.processPresentation(
      verifiablePresentation,
      this.vpSubmissionVerifierService
    );

    if (response.errors.length > 0) {
      throw new Error(`processing the presentation failed:\n\t${response.errors.join('\n\t')}`);
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

    callback?.forEach((callback) => {
      this.httpService.post(callback.url, body).subscribe({
        next: (v) => this.logger.log(inspect(v)), // inspect used to replace circular references https://stackoverflow.com/a/18354289
        error: (e) => this.logger.error(inspect(e))
      });
    });

    return response;
  }

  public async getExchange(exchangeId: string): Promise<{ errors: string[]; exchange?: ExchangeEntity }> {
    const exchange = await this.exchangeRepository.findOneBy({ exchangeId });
    if (!exchange) {
      return { errors: [`${exchangeId}: no exchange found for this transaction id`] };
    }
    return { errors: [], exchange: exchange };
  }

  public async getExchangeTransaction(
    transactionId: string
  ): Promise<{ errors: string[]; transaction?: TransactionEntity }> {
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

  public async addReview(transactionId: string, reviewDto: SubmissionReviewDto) {
    const transactionQuery = await this.getExchangeTransaction(transactionId);
    if (transactionQuery.errors.length > 0 || !transactionQuery.transaction) {
      return {
        errors: transactionQuery.errors
      };
    }
    const transaction = transactionQuery.transaction;
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
