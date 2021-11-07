import { Controller, Get, Param, Post } from '@nestjs/common';
import { Methods } from '@ew-did-registry/did';
import { DIDService } from './did.service';
import { EthrDID } from '@energyweb/ssi-did';

@Controller('did')
export class DIDController {
  constructor(private didService: DIDService) {}

  @Post()
  async create(method: Methods, options: Record<string, unknown>): Promise<EthrDID> {
    if (method === Methods.Erc1056) {
    }
    return await this.didService.generateEthrDID();
  }

  @Get('/:did')
  async getByDID(@Param('did') did: string): Promise<EthrDID> {
    return await this.didService.getDID(did);
  }
}
