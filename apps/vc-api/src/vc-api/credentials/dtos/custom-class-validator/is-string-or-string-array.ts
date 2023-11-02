/*
 * Copyright 2021 - 2023 Energy Web Foundation
 * SPDX-License-Identifier: Apache-2.0
 */

import { registerDecorator, ValidationOptions } from 'class-validator';

/**
 * A custom validator to check if a value is a string or a array or strings
 * https://github.com/typestack/class-validator#custom-validation-classes
 * https://github.com/typestack/class-validator/issues/160
 * https://github.com/typestack/class-validator/issues/558
 * An example use case of this is the "type" property from the VC data model: https://www.w3.org/TR/vc-data-model/#types
 * @param validationOptions
 * @returns
 */
export function IsStringOrStringArray(validationOptions?: ValidationOptions) {
  return function (object: unknown, propertyName: string) {
    registerDecorator({
      name: 'isStringOrStringArray',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [],
      options: validationOptions,
      validator: {
        validate(value: unknown) {
          return typeof value === 'string' || Array.isArray(value);
        }
      }
    });
  };
}
