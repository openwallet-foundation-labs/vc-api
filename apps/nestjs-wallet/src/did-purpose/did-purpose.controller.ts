import { Controller, Post, Put } from '@nestjs/common';

@Controller('did-purpose')
export class DIDPurposeController {

  @Post()
  async create(did: string, purpose: string) {
    throw new Error("Not implemented")
  }

  @Put()
  async update(did: string, purpose: string) {
    throw new Error("Not implemented")
  }
}
