/*
 * Copyright 2021 - 2023 Energy Web Foundation
 * SPDX-License-Identifier: Apache-2.0
 */

import { BadRequestException, Body, Controller, Get, NotFoundException, Param, Post } from '@nestjs/common';
import { DIDService } from './did.service';
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
import { CreateDidOptionsDto } from './dto/create-did-options.dto';
import { DidMethod } from './types/did-method';
import { CreateDidResponseDto } from './dto/create-did-response.dto';
import { BadRequestErrorResponseDto } from '../dtos/bad-request-error-response.dto';
import { NotFoundErrorResponseDto } from '../dtos/not-found-error-response.dto';
import { InternalServerErrorResponseDto } from '../dtos/internal-server-error-response.dto';

@ApiTags('did')
@Controller('did')
@ApiInternalServerErrorResponse({ type: InternalServerErrorResponseDto })
export class DIDController {
  constructor(private didService: DIDService) {}

  @Post()
  @ApiBody({ type: CreateDidOptionsDto })
  @ApiCreatedResponse({ type: CreateDidResponseDto })
  @ApiBadRequestResponse({ type: BadRequestErrorResponseDto })
  @ApiOperation({ description: 'Generate a new DID' })
  async create(@Body() body: CreateDidOptionsDto): Promise<CreateDidResponseDto> {
    if (body.method === DidMethod.ethr) {
      return new CreateDidResponseDto(await this.didService.generateEthrDID());
    }
    if (body.method === DidMethod.key) {
      if (body.keyId) {
        return await this.didService.registerKeyDID(body.keyId);
      }
      return new CreateDidResponseDto(await this.didService.generateKeyDID());
    }
    throw new BadRequestException('Requested DID method not supported');
  }

  @Get('/:did')
  @ApiOkResponse({ type: CreateDidResponseDto })
  @ApiNotFoundResponse({ type: NotFoundErrorResponseDto })
  @ApiOperation({ description: 'Retrieve exisiting DID' })
  async getByDID(@Param('did') did: string): Promise<CreateDidResponseDto> {
    const didDoc = await this.didService.getDID(did);

    if (!didDoc) {
      throw new NotFoundException(`${did} not found`);
    }

    return new CreateDidResponseDto(didDoc);
  }
}
