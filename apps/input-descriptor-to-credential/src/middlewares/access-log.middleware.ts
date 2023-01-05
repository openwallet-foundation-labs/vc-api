/*
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

import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';

@Injectable()
export class AccessLog implements NestMiddleware {
  private readonly logger = new Logger(AccessLog.name, { timestamp: true });

  use(req: Request, res: Response, next: NextFunction) {
    const now = Date.now();
    const { method } = req;
    const url = req.originalUrl;

    let finished = false;

    res.on('finish', () => {
      const delay = Date.now() - now;
      const message = `${res.statusCode} | [${method}] ${url} - ${delay}ms`;

      finished = true;

      if (is4xxErrorCode(res.statusCode)) {
        this.logger.warn(message);
      } else if (is5xxErrorCode(res.statusCode)) {
        this.logger.error(message);
      } else {
        this.logger.log(message);
      }
    });

    res.on('close', () => {
      if (!finished) {
        const delay = Date.now() - now;
        this.logger.warn(`interrupted | [${method}] ${url} - ${delay}ms`);
      }
    });

    next();
  }
}

function is4xxErrorCode(statusCode: number) {
  return statusCode.toString().match(/4[0-9]{2}/);
}

function is5xxErrorCode(statusCode: number) {
  return statusCode.toString().match(/5[0-9]{2}/);
}
