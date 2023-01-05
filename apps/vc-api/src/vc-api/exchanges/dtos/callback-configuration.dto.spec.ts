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
import { CallbackConfigurationDto } from './callback-configuration.dto';

describe('CallbackConfigurationDto', () => {
  it('should allow a URL that is a localhost', async () => {
    const dto = new CallbackConfigurationDto();
    dto.url = 'http://localhost:80';
    const result = await validate(dto);
    expect(result).toHaveLength(0);
  });
  it('should allow a URL that is a toplevel domain', async () => {
    const dto = new CallbackConfigurationDto();
    dto.url = 'https://example.com/callback';
    const result = await validate(dto);
    expect(result).toHaveLength(0);
  });
  it('should fail for URL that is not a URL', async () => {
    const dto = new CallbackConfigurationDto();
    dto.url = 'not-a-url';
    const result = await validate(dto);
    expect(result).toHaveLength(1);
  });
});
