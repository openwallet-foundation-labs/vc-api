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

import { IsTopLevelFieldJsonPathConstraint } from './is-top-level-field-json-path';

describe(IsTopLevelFieldJsonPathConstraint.name, function () {
  let instance: IsTopLevelFieldJsonPathConstraint;

  beforeEach(async function () {
    instance = new IsTopLevelFieldJsonPathConstraint();
  });

  it('should be defined', function () {
    expect(instance).toBeDefined();
  });

  it('should reject not string values', function () {
    expect(instance.validate({})).toBe(false);
    expect(instance.validate([])).toBe(false);
    expect(instance.validate(null)).toBe(false);
    expect(instance.validate(undefined)).toBe(false);
  });

  it('should reject not JSON path string', function () {
    expect(instance.validate('foobar')).toBe(false);
    expect(instance.validate('sdf.foobar')).toBe(false);
    expect(instance.validate('$.')).toBe(false);
  });

  it('should accept top-level JSON path string', function () {
    expect(instance.validate('$.fieldName')).toBe(true);
  });

  it('should reject 2nd and more level path string', function () {
    expect(instance.validate('$.first.second')).toBe(false);
    expect(instance.validate('$.first.second.third')).toBe(false);
    expect(instance.validate('$.first.second.third.fourth')).toBe(false);
  });
});
