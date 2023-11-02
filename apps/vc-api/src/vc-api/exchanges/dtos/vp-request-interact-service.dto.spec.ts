/*
 * Copyright 2021 - 2023 Energy Web Foundation
 * SPDX-License-Identifier: Apache-2.0
 */

import { validate } from 'class-validator';
import { VpRequestInteractServiceType } from '../types/vp-request-interact-service-type';
import { VpRequestInteractServiceDto } from './vp-request-interact-service.dto';

describe('VpRequestInteractServiceDto', () => {
  it('should allow a serviceEndpoint that is a localhost', async () => {
    const dto = new VpRequestInteractServiceDto();
    dto.serviceEndpoint = 'http://localhost:80';
    dto.type = VpRequestInteractServiceType.unmediatedPresentation;
    const result = await validate(dto);
    expect(result).toHaveLength(0);
  });
  it('should allow a serviceEndpoint that is a toplevel domain', async () => {
    const dto = new VpRequestInteractServiceDto();
    dto.serviceEndpoint = 'https://example.com/callback';
    dto.type = VpRequestInteractServiceType.unmediatedPresentation;
    const result = await validate(dto);
    expect(result).toHaveLength(0);
  });
  it('should fail for serviceEndpoint that is not a URL', async () => {
    const dto = new VpRequestInteractServiceDto();
    dto.serviceEndpoint = 'not-a-url';
    dto.type = VpRequestInteractServiceType.unmediatedPresentation;
    const result = await validate(dto);
    expect(result).toHaveLength(1);
  });
});
