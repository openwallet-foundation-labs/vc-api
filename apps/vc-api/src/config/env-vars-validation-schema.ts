/*
 * Copyright 2021 - 2023 Energy Web Foundation
 * SPDX-License-Identifier: Apache-2.0
 */

import * as Joi from 'joi';

export const envVarsValidationSchema = Joi.object({
  NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),
  PORT: Joi.number().integer().positive().default(3000),
  BASE_URL: Joi.string().uri().default('http://localhost:3000')
});
