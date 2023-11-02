/*
 * Copyright 2021 - 2023 Energy Web Foundation
 * SPDX-License-Identifier: Apache-2.0
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
