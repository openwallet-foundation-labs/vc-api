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
