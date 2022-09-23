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

import { BadRequestException, Body, Controller, Get, NotFoundException, Param, Post } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiCreatedResponse,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags
} from '@nestjs/swagger';
import { validate } from 'class-validator';
import { KeyDescriptionDto } from './dtos/key-description.dto';
import { KeyPairDto } from './dtos/key-pair.dto';
import { KeyService } from './key.service';
import { BadRequestErrorResponseDto } from '../dtos/bad-request-error-response.dto';
import { NotFoundErrorResponseDto } from '../dtos/not-found-error-response.dto';
import { InternalServerErrorResponseDto } from '../dtos/internal-server-error-response.dto';

@ApiTags('key')
@Controller('key')
@ApiInternalServerErrorResponse({ type: InternalServerErrorResponseDto })
export class KeyController {
  constructor(private keyService: KeyService) {}

  /**
   * Import a key
   * @param body key pair to import
   * @returns KeyDescription of imported key
   */
  @Post()
  @ApiBody({ type: KeyPairDto })
  @ApiCreatedResponse({ type: KeyDescriptionDto })
  @ApiBadRequestResponse({ type: BadRequestErrorResponseDto })
  @ApiOperation({ description: 'Import a key' })
  async import(@Body() body: KeyPairDto): Promise<KeyDescriptionDto> {
    return await this.keyService.importKey(body);
  }

  @Get('/:keyId')
  @ApiOkResponse({ type: KeyPairDto })
  @ApiNotFoundResponse({ type: NotFoundErrorResponseDto })
  async export(@Param('keyId') keyId: string): Promise<KeyPairDto> {
    const keyDescription = new KeyDescriptionDto();
    keyDescription.keyId = keyId;
    try {
      await validate(keyDescription);
    } catch (error) {
      throw new BadRequestException(error);
    }
    const key = await this.keyService.exportKey(keyDescription);

    if (!key) {
      throw new NotFoundException(`keyId=${keyId} not found`);
    }

    return key;
  }
}
