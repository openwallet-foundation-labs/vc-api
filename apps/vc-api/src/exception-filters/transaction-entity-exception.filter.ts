/*
 * Copyright 2021 - 2023 Energy Web Foundation
 * SPDX-License-Identifier: Apache-2.0
 */

import { BaseExceptionFilter } from '@nestjs/core';
import { TransactionEntityException } from '../vc-api/exchanges/entities/transaction.entity';
import { ArgumentsHost, Catch, ForbiddenException, Logger } from '@nestjs/common';

@Catch(TransactionEntityException)
export class TransactionEntityExceptionFilter extends BaseExceptionFilter {
  private readonly logger: Logger = new Logger(TransactionEntityExceptionFilter.name, { timestamp: true });

  catch(exception: TransactionEntityException, host: ArgumentsHost): void {
    switch (exception.name) {
      case 'TransactionDidForbiddenException':
        this.logger.warn(exception);
        super.catch(new ForbiddenException(exception.message), host);
        break;

      default:
        this.logger.error(exception);
        super.catch(exception, host);
        break;
    }
  }
}
