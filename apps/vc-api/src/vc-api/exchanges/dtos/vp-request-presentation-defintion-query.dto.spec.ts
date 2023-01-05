/**
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

import { validate } from 'class-validator';
import 'reflect-metadata';
import { VpRequestPresentationDefinitionQueryDto } from './vp-request-presentation-defintion-query.dto';

describe('VpRequestPresentationDefinitionQueryDto', () => {
  it('should validate valid presentation definition', async () => {
    const query = new VpRequestPresentationDefinitionQueryDto();
    query.presentationDefinition = {
      id: '286bc1e0-f1bd-488a-a873-8d71be3c690e',
      input_descriptors: [
        {
          id: 'my_pres_definition',
          name: 'My presentation definition'
        }
      ]
    };
    const result = await validate(query);
    expect(result).toHaveLength(0);
  });
  it('should validate invalid presentation definition', async () => {
    const query = new VpRequestPresentationDefinitionQueryDto();
    query.presentationDefinition = {
      //@ts-expect-error: [justification is needed here]
      input_descriptors: 10
    };
    const result = await validate(query);
    expect(result).toHaveLength(1);
  });
});
