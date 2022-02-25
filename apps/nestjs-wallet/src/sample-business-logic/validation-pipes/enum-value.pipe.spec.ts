import { BadRequestException } from '@nestjs/common';
import { ExchangeId } from '../types/exchange-id';
import { EnumValueValidationPipe } from './enum-value.pipe';

describe('EnumValueValidationPipe', () => {
  let target: EnumValueValidationPipe;

  beforeEach(() => {
    target = new EnumValueValidationPipe(ExchangeId);
  });

  it('throws exception if value is undefined', async () => {
    expect.assertions(1);
    try {
      await target.transform(undefined);
    } catch (error) {
      expect(error).toStrictEqual(new BadRequestException('the value is not defined.'));
    }
  });

  it('throws exception if value is not in enum values', async () => {
    expect.assertions(1);
    try {
      await target.transform('not-in-enum-values');
    } catch (error) {
      expect(error).toBeInstanceOf(BadRequestException);
    }
  });

  it('returns enum is value is part of enum', async () => {
    expect(target.transform(ExchangeId.permanent_resident_card_issuance)).toEqual(
      ExchangeId.permanent_resident_card_issuance
    );
  });
});
