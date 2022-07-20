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

import { Test, TestingModule } from '@nestjs/testing';
import { ConverterService } from './converter.service';
import { InputDesciptorToCredentialDto } from './dtos';

describe('ConverterService', () => {
  let service: ConverterService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ConverterService]
    }).compile();

    service = module.get<ConverterService>(ConverterService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('convertInputDescriptorToCredential', function () {
    it('should be defined', function () {
      expect(service.convertInputDescriptorToCredential).toBeDefined();
    });

    describe('when called with valid input', function () {
      const input: InputDesciptorToCredentialDto = {
        constraints: {
          fields: [
            {
              path: '$.@context',
              filter: {
                $schema: 'http://json-schema.org/draft-07/schema#',
                type: 'array',
                items: [
                  {
                    const: 'https://www.w3.org/2018/credentials/v1'
                  },
                  {
                    $ref: '#/definitions/eliaGroupContext'
                  }
                ],
                additionalItems: false,
                minItems: 2,
                maxItems: 2,
                definitions: {
                  eliaGroupContext: {
                    type: 'object',
                    properties: {
                      elia: {
                        const: 'https://https://www.eliagroup.eu/ld-context-2022#'
                      },
                      consent: {
                        const: 'elia:consent'
                      }
                    },
                    additionalProperties: false,
                    required: ['elia', 'consent']
                  }
                }
              }
            },
            {
              path: '$.id',
              filter: {
                type: 'string',
                const: 'foobar'
              }
            }
          ]
        }
      };

      it('should execute', async function () {
        await service.convertInputDescriptorToCredential(input);
      });

      describe('then, execution result', function () {
        let result;

        beforeEach(async function () {
          result = await service.convertInputDescriptorToCredential(input);
        });

        it('should be defined', async function () {
          expect(result).toBeDefined();
        });

        it('should match expected result', async function () {
          expect(result).toEqual({
            '@context': [
              'https://www.w3.org/2018/credentials/v1',
              {
                consent: 'elia:consent',
                elia: 'https://https://www.eliagroup.eu/ld-context-2022#'
              }
            ],
            id: 'foobar'
          });
        });
      });
    });
  });
});
