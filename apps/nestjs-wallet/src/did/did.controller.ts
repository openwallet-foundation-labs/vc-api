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
    throw new Error("Not implemented")
  }
}
