import { Controller, Post } from '@nestjs/common';
import { Methods } from '@ew-did-registry/did';
import { DIDService } from './did.service';

@Controller('did')
export class DIDController {
  constructor(private didService: DIDService) {}

  @Post()
  async create(method: Methods, options: Record<string, unknown>) {
    if (method === Methods.Erc1056) {
    }
    return await this.didService.generateEthrDID();
  }
}
