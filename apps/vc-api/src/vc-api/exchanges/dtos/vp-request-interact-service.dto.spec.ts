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
