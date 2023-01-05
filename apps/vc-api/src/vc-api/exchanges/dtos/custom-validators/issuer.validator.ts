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
