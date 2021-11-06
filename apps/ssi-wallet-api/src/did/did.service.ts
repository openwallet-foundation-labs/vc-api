import { EthrDIDFactory } from '@energyweb/ssi-did';
import { Injectable } from '@nestjs/common';
import { KeyService } from '../key/key.service';

@Injectable()
export class DIDService {
  constructor(private keyService: KeyService) {}

  public async generateEthrDID() {
    // TODO: make EthrDidFactory shared between calls
    const factory = new EthrDIDFactory(this.keyService);
    const did = await factory.create();
    // TODO: store in DB
    return did;
  }
}
