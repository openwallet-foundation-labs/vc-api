import { IPresentationDefinition, PEX, Status } from '@sphereon/pex';
import { registerDecorator, ValidationOptions, ValidationArguments } from 'class-validator';

/**
 * https://github.com/typestack/class-validator#custom-validation-decorators
 */
export function IsPresentationDefinitionCredentialQuery(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isPresentationDefinitionCredentialQuery',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [],
      options: validationOptions,
      validator: {
        validate(value: IPresentationDefinition, args: ValidationArguments) {
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
      }
    });
  };
}
