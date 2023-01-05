/*
 * Copyright 2021 - 2023 Energy Web Foundation
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

import { IsValidConstraintsFieldsPathsConstraint } from './is-valid-constraints-fields-paths';

const validPayload = [
  {
    path: '$.@context'
  },
  {
    path: '$.type'
  },
  {
    path: '$.credentialSubject'
  }
];

describe(IsValidConstraintsFieldsPathsConstraint.name, function () {
  let instance: IsValidConstraintsFieldsPathsConstraint;
  beforeEach(async function () {
    instance = new IsValidConstraintsFieldsPathsConstraint();
  });

  it('should be defined', async function () {
    expect(instance).toBeDefined();
  });

  it('should accept valid payload', async function () {
    expect(instance.validate(validPayload)).toBe(true);
    expect(instance.validate([...validPayload, { path: 'foobar' }])).toBe(true);
    expect(instance.validate([...validPayload, {}])).toBe(true);
  });

  describe('when invalid payload provided', function () {
    describe('that is not an array', function () {
      it('should reject', async function () {
        expect(instance.validate(null)).toBe(false);
        expect(instance.validate(undefined)).toBe(false);
        expect(instance.validate(1)).toBe(false);
        expect(instance.validate('1')).toBe(false);
        expect(instance.validate({ foo: 1 })).toBe(false);
        expect(instance.validate({ foo: '1' })).toBe(false);
        expect(instance.validate({ foo: [] })).toBe(false);
      });
    });

    describe('that is empty array', function () {
      it('should reject', async function () {
        expect(instance.validate([])).toBe(false);
      });
    });

    describe('that is an array of empty objects', function () {
      it('should reject', async function () {
        expect(instance.validate([{}, {}, {}])).toBe(false);
      });
    });

    describe('that is an array of objects not containing all required path values', function () {
      it('should reject', async function () {
        const invalid1 = JSON.parse(JSON.stringify(validPayload));
        invalid1[0].path = 'foobar';
        const invalid2 = JSON.parse(JSON.stringify(validPayload));
        invalid2[1].path = 'foobar';
        const invalid3 = JSON.parse(JSON.stringify(validPayload));
        invalid3[2].path = 'foobar';

        expect(instance.validate(invalid1)).toBe(false);
        expect(instance.validate(invalid2)).toBe(false);
        expect(instance.validate(invalid3)).toBe(false);
      });
    });
  });
});
