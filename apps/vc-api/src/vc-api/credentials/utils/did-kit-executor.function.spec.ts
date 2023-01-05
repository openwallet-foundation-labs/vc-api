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

import { didKitExecutor } from './did-kit-executor.function';
import { BadRequestException } from '@nestjs/common';

describe('didKitExecutor', function () {
  it('should be defined', async function () {
    expect(didKitExecutor).toBeDefined();
  });

  describe('when executed', function () {
    describe('when valid function provided', function () {
      const spy = jest.fn().mockResolvedValue(JSON.stringify({ foo: 'bar' }));

      it('should call the function', async function () {
        await didKitExecutor(() => spy(), 'spy');

        expect(spy).toHaveBeenCalled();
      });

      it('should return parsed data', async function () {
        expect(await didKitExecutor(() => spy(), 'spy')).toEqual({ foo: 'bar' });
      });
    });

    describe('when called with function that throws a `string` type of error', function () {
      const spy = jest.fn();

      beforeEach(async function () {
        spy.mockReset().mockImplementation(async () => {
          throw 'string error';
        });
      });

      it('should throw BadRequestException', async function () {
        await expect(() => didKitExecutor(() => spy(), 'spy')).rejects.toBeInstanceOf(BadRequestException);
      });

      describe('and the exception message', function () {
        it('should be correct', async function () {
          try {
            await didKitExecutor(() => spy(), 'methodName');
          } catch (err) {
            expect(err.message).toEqual('@spruceid/didkit-wasm-node.methodName error: string error');
          }
        });
      });
    });

    describe('when called with function that throws instance of the Error', function () {
      const spy = jest.fn();

      beforeEach(async function () {
        spy.mockReset().mockImplementation(async () => {
          throw new Error('something unexpected happened');
        });
      });

      it('should throw BadRequestException', async function () {
        await expect(() => didKitExecutor(() => spy(), 'spy')).rejects.toBeInstanceOf(Error);
      });

      describe('and the exception message', function () {
        it('should be correct', async function () {
          try {
            await didKitExecutor(() => spy(), 'methodName');
          } catch (err) {
            expect(err.message).toEqual('something unexpected happened');
          }
        });
      });
    });

    describe('when called with function that returns unparsable result', function () {
      const spy = jest.fn();

      beforeEach(async function () {
        spy.mockReset().mockImplementation(async () => {
          return 'unparable string';
        });
      });

      it('should throw instance of the Error', async function () {
        await expect(() => didKitExecutor(() => spy(), 'spy')).rejects.toBeInstanceOf(Error);
      });

      describe('and error message', function () {
        it('should be correct', async function () {
          try {
            await didKitExecutor(() => spy(), 'methodName');
          } catch (err) {
            expect(err.message).toEqual('@spruceid/didkit-wasm-node.methodName returned unparseable result');
          }
        });
      });
    });
  });
});
