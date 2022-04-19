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

import { registerDecorator, ValidationOptions, ValidationArguments } from 'class-validator';

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
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isStringOrStringArray',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [],
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          return typeof value === 'string' || Array.isArray(value);
        }
      }
    });
  };
}
