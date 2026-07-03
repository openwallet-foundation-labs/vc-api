/*
 * Copyright 2021 - 2023 Energy Web Foundation
 * SPDX-License-Identifier: Apache-2.0
 */

import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

/**
 * Express 5 leaves req.body undefined when a request has no body, whereas
 * Express 4 defaulted it to {}. The VC API spec allows exchanges to be
 * (re)entered by "posting an empty body", so restore the previous default.
 */
@Injectable()
export class BodyDefaultMiddleware implements NestMiddleware {
  use(req: Request, _res: Response, next: NextFunction) {
    req.body ??= {};
    next();
  }
}
