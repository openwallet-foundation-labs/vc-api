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

import { Body, Controller, Post } from '@nestjs/common';
import { ConverterService } from './converter.service';
import { InputDesciptorToCredentialDto, InputDescriptorToCredentialResponseDto } from './dtos';
import { CredentialDto } from './dtos/credential.dto';

@Controller('converter')
export class ConverterController {
  constructor(private readonly converterService: ConverterService) {}

  @Post('input-descriptor-to-credential')
  async inputDescriptorToCredential(
    @Body() inputDesciptorToCredentialDto: InputDesciptorToCredentialDto
  ): Promise<InputDescriptorToCredentialResponseDto> {
    return new InputDescriptorToCredentialResponseDto({
      credential: new CredentialDto(
        await this.converterService.convertInputDescriptorToCredential(inputDesciptorToCredentialDto)
      )
    });
  }
}
