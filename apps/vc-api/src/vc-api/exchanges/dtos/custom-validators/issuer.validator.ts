/*
 * Copyright 2021 - 2023 Energy Web Foundation
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  isObject,
  isString,
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  validate
} from 'class-validator';
import { IssuerDto } from '../../../credentials/dtos/issuer.dto';

@ValidatorConstraint({ async: true })
export class IsIssuerValidatorConstraint implements ValidatorConstraintInterface {
  async validate(value: unknown): Promise<boolean> {
    if (isString(value)) {
      return true;
    }

    if (isObject(value)) {
      const instance = new IssuerDto(value);
      const validationErrors = await validate(instance);
      // TODO: check how to pass detailed message to the http response
      return validationErrors.length === 0;
    }

    return false;
  }

  defaultMessage(validationArguments?: ValidationArguments): string {
    return `${validationArguments.property} is not valid issuer`;
  }
}

export function IsIssuer(options?: ValidationOptions) {
  return function (object: unknown, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options,
      validator: IsIssuerValidatorConstraint
    });
  };
}
