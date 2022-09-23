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

import { IPresentationDefinition, PEX, Status } from '@sphereon/pex';
import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface
} from 'class-validator';

/**
 * https://github.com/typestack/class-validator#custom-validation-decorators
 */

@ValidatorConstraint({ async: false })
export class IsPresentationDefinitionCredentialQueryConstraint implements ValidatorConstraintInterface {
  validate(value: IPresentationDefinition): boolean {
    const pex = new PEX();
    try {
      const validated = pex.validateDefinition(value);
      const resultArray = Array.isArray(validated) ? validated : [validated];
      const statuses = resultArray.map((checked) => checked.status);
      if (statuses.includes(Status.ERROR) || statuses.includes(Status.WARN)) {
        return false;
      }
      return true;
    } catch {
      return false;
    }
  }

  defaultMessage(validationArguments?: ValidationArguments): string {
    return `${validationArguments.property} is not valid PresentationDefinitionCredentialQuery`;
  }
}

export function IsPresentationDefinitionCredentialQuery(validationOptions?: ValidationOptions) {
  return function (object: unknown, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: IsPresentationDefinitionCredentialQueryConstraint
    });
  };
}
