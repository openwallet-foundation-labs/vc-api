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

import { Test, TestingModule } from '@nestjs/testing';
import { ConverterController } from './converter.controller';
import { ConverterService } from './converter.service';
import { InputDesciptorToCredentialDto } from './dtos';

const mockConverterService = {
  convertInputDescriptorToCredential: jest.fn()
};

describe('ConverterController', () => {
  let controller: ConverterController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ConverterController],
      providers: [
        {
          provide: ConverterService,
          useValue: mockConverterService
        }
      ]
    }).compile();

    controller = module.get<ConverterController>(ConverterController);

    mockConverterService.convertInputDescriptorToCredential.mockClear();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('inputDescriptorToCredential', function () {
    it('should be defined', function () {
      expect(controller.inputDescriptorToCredential).toBeDefined();
    });

    describe('when called', function () {
      const validPayload: InputDesciptorToCredentialDto = {
        constraints: {
          fields: [
            {
              path: ['$.@context'],
              filter: {}
            }
          ]
        }
      };

      it('should call ConverterService.convertInputDescriptorToCredential()', async function () {
        const spy = jest.spyOn(mockConverterService, 'convertInputDescriptorToCredential');
        await controller.inputDescriptorToCredential(validPayload);
        expect(spy).toHaveBeenLastCalledWith(validPayload);
      });

      it('should return ConverterService.convertInputDescriptorToCredential() result', async function () {
        const resultExpected = {
          credential: { '@context': ['foobar'] }
        };
        jest.spyOn(mockConverterService, 'convertInputDescriptorToCredential').mockImplementation(() => {
          return resultExpected.credential;
        });
        const result = await controller.inputDescriptorToCredential(validPayload);
        expect(result).toEqual(resultExpected);
      });
    });
  });
});
