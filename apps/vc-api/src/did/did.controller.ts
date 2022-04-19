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

import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { DIDService } from './did.service';
import { DIDDocument, VerificationMethod } from 'did-resolver';
import { ApiTags } from '@nestjs/swagger';
import { CreateDidOptionsDto } from './dto/create-did-options.dto';

@ApiTags('did')
@Controller('did')
export class DIDController {
  constructor(private didService: DIDService) {}

  /**
   * Generate a new DID
   * @param body options for DID creation
   * @returns DIDDocument of new DID
   */
  @Post()
  async create(@Body() body: CreateDidOptionsDto): Promise<DIDDocument> {
    if (body.method === 'ethr') {
      return await this.didService.generateEthrDID();
    }
    if (body.method === 'key') {
      return await this.didService.generateKeyDID();
    }
    throw new Error('Requested DID method not supported');
  }

  @Get('/:did')
  async getByDID(@Param('did') did: string): Promise<DIDDocument> {
    return await this.didService.getDID(did);
  }

  /**
   * Retrieves a verification method
   * @param id
   */
  @Get('/verification-method/:id')
  async getVerificationMethods(@Param('id') id: string): Promise<VerificationMethod> {
    throw new Error('Not implemented');
  }

  /**
   * Update the descriptive information information related to a DID
   * "label" is kept in DID module because there is a one to one mapping between a DID and its label
   * @param did
   * @param label
   * @param description
   * @returns A DIDLabel entity
   */
  @Post('/label/:did')
  async label(did: string, label: string, description: string) {
    throw new Error('Not implemented');
  }
}
