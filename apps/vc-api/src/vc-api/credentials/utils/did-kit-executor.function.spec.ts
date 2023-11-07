/*
 * Copyright 2021 - 2023 Energy Web Foundation
 * SPDX-License-Identifier: Apache-2.0
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
