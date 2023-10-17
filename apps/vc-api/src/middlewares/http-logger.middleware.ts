import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';

@Injectable()
export class HttpLoggerMiddleware implements NestMiddleware {
  private readonly logger = new Logger(HttpLoggerMiddleware.name, { timestamp: true });

  use(req: Request, res: Response, next: NextFunction) {
    const requestStarted = Date.now();
    const { method } = req;
    const url = req.originalUrl;

    let finished = false;

    const oldWrite = res.write;
    const oldEnd = res.end;
    const chunks: Buffer[] = [];
    let responseBody: string;

    res.write = (...args: unknown[]): boolean => {
      chunks.push(args[0] as Buffer);
      return oldWrite.apply(res, args);
    };

    res.end = (...args: unknown[]) => {
      const chunk = args[0] as Buffer;

      if (chunk) {
        chunks.push(chunk);
      }

      responseBody = Buffer.concat(chunks).toString();
      return oldEnd.apply(res, args);
    };

    res.on('finish', () => {
      const message = `${res.statusCode} ${res.statusMessage} | ${req.ip} | [${method}] ${url} - ${
        Date.now() - requestStarted
      }ms`;

      finished = true;

      if (this.is4xxErrorCode(res.statusCode)) {
        this.logger.warn(message);
      } else if (this.is5xxErrorCode(res.statusCode)) {
        this.logger.error(message);
      } else {
        this.logger.log(message);
      }

      if (req.body) {
        this.logger.debug(`request body: ${JSON.stringify(req.body)}`);
      }

      if (responseBody) {
        this.logger.debug(`response body: ${responseBody}`);
      }
    });

    res.on('close', () => {
      if (!finished) {
        this.logger.warn(`connection closed | [${method}] ${url} - ${Date.now() - requestStarted}ms`);
      }
    });

    next();
  }

  is4xxErrorCode(statusCode: number): boolean {
    return statusCode >= 400 && statusCode < 500;
  }

  is5xxErrorCode(statusCode: number): boolean {
    return statusCode >= 500 && statusCode < 600;
  }
}
