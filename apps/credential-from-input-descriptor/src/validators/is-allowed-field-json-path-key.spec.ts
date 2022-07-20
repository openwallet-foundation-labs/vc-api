/*
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

import { IsAllowedFieldJsonPathKeyConstraint } from './is-allowed-field-json-path-key';

describe(IsAllowedFieldJsonPathKeyConstraint.name, function () {
  let instance: IsAllowedFieldJsonPathKeyConstraint;
  beforeEach(async function () {
    instance = new IsAllowedFieldJsonPathKeyConstraint();
  });

  it('should be defined', function () {
    expect(instance).toBeDefined();
  });

  it('should accept allowed values', function () {
    expect(instance.validate('$.@context')).toBe(true);
    expect(instance.validate('$.credentialSubject')).toBe(true);
    expect(instance.validate('$.id')).toBe(true);
    expect(instance.validate('$.issuanceDate')).toBe(true);
    expect(instance.validate('$.type')).toBe(true);
  });

  it('should reject not allowed values', function () {
    expect(instance.validate('$')).toBe(false);
    expect(instance.validate('$.')).toBe(false);
    expect(instance.validate('$.foobar')).toBe(false);
    expect(instance.validate('$.id.')).toBe(false);
    expect(instance.validate('$.id.issuer')).toBe(false);
  });
});
