import { BadRequestException } from '@nestjs/common';
import { WorkflowName } from '../types/workflow-type';
import { EnumValueValidationPipe } from './enum-value.pipe';

describe('EnumValueValidationPipe', () => {
  let target: EnumValueValidationPipe;

  beforeEach(() => {
    target = new EnumValueValidationPipe(WorkflowName);
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
    expect(target.transform(WorkflowName.permanent_resident_card_issuance)).toEqual(
      WorkflowName.permanent_resident_card_issuance
    );
  });
});
