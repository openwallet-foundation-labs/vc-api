import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';

/**
 * Pipe to convert from enum value to enum key
 * Inspired by https://stackoverflow.com/a/67115340
 */
@Injectable()
export class EnumValueValidationPipe implements PipeTransform<string, Promise<any>> {
  constructor(private enumEntity: any) {}
  transform(value: string): Promise<any> {
    if (!value) {
      const errorMessage = `the value is not defined.`;
      throw new BadRequestException(errorMessage);
    }
    const enumKey = getEnumKeyByEnumValue(this.enumEntity, value);
    if (!enumKey) {
      const errorMessage = `the value ${value} is not valid. See the acceptable values: ${Object.keys(
        this.enumEntity
      ).map((key) => this.enumEntity[key])}`;
      throw new BadRequestException(errorMessage);
    }
    return this.enumEntity[enumKey];
  }
}

/**
 * Allows conversion from the value of an enum to the enum key
 * https://stackoverflow.com/questions/54297376/getting-the-enum-key-with-the-value-string-reverse-mapping-in-typescript
 * @param myEnum the enum type
 * @param enumValue the enum value
 * @returns the enum key corresponding to the value
 */
function getEnumKeyByEnumValue<T extends { [index: string]: string }>(
  myEnum: T,
  enumValue: string
): keyof T | null {
  let keys = Object.keys(myEnum).filter((x) => myEnum[x] == enumValue);
  return keys.length > 0 ? keys[0] : null;
}
