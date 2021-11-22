import { Controller, Post, Put } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('did-purpose')
@Controller('did-purpose')
export class DIDPurposeController {
  @Post()
  async create(did: string, purpose: string) {
    throw new Error('Not implemented');
  }

  @Put()
  async update(did: string, purpose: string) {
    throw new Error('Not implemented');
  }
}
