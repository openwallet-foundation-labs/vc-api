/**
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

import { BadRequestException, Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { validate } from 'class-validator';
import { KeyDescriptionDto } from './dtos/key-description.dto';
import { KeyPairDto } from './dtos/key-pair.dto';
import { KeyService } from './key.service';

@ApiTags('key')
@Controller('key')
export class KeyController {
  constructor(private keyService: KeyService) {}

  /**
   * Import a key
   * @param body key pair to import
   * @returns KeyDescription of imported key
   */
  @Post()
  async import(@Body() body: KeyPairDto): Promise<KeyDescriptionDto> {
    return await this.keyService.importKey(body);
  }

  @Get('/:keyId')
  async export(@Param('keyId') keyId: string): Promise<KeyPairDto> {
    const keyDescription = new KeyDescriptionDto();
    keyDescription.keyId = keyId;
    try {
      validate(keyDescription);
    } catch (error) {
      throw new BadRequestException(error);
    }
    return await this.keyService.exportKey(keyDescription);
  }
}
