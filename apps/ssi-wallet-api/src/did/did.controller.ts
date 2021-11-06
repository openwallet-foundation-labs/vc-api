import { Controller, Post } from '@nestjs/common';
import { Methods } from '@ew-did-registry/did';

@Controller('did')
export class DidController {
  @Post()
  create(method: Methods, options: Record<string, unknown>) {
    if (method === Methods.Erc1056) {
    }
    return undefined;
  }
}
