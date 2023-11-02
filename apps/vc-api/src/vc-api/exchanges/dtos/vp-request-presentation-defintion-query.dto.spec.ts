/*
 * Copyright 2021 - 2023 Energy Web Foundation
 * SPDX-License-Identifier: Apache-2.0
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
