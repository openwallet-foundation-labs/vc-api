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
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface
} from 'class-validator';
import { ValidationArguments } from 'class-validator/types/validation/ValidationArguments';
import jsf from 'json-schema-faker';

@ValidatorConstraint({ async: false })
export class IsValidJsonSchemaConstraint implements ValidatorConstraintInterface {
  async validate(value: unknown): Promise<boolean> {
    try {
      await jsf.resolve(value);
    } catch (err) {
      return false;
    }

    return true;
  }

  defaultMessage(validationArguments: ValidationArguments): string {
    return `${validationArguments.property} value must be a valid JSON schema`;
  }
}

export function IsValidJsonSchema(options?: ValidationOptions) {
  return function (object: unknown, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options,
      validator: IsValidJsonSchemaConstraint
    });
  };
}
