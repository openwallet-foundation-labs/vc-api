import { EthrDID, EthrDIDFactory } from '@energyweb/ssi-did';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { KeyService } from '../key/key.service';

@Injectable()
export class DIDService {
  constructor(
    private keyService: KeyService,
    @InjectRepository(EthrDID)
    private didRepository: Repository<EthrDID>
  ) {}

  public async generateEthrDID(): Promise<EthrDID> {
    // TODO: make EthrDidFactory shared between calls
    const factory = new EthrDIDFactory(this.keyService);
    const did = await factory.create();
    this.didRepository.save(did);
    return did;
  }

  public async getDID(did: string): Promise<EthrDID> {
    return await this.didRepository.findOne(did);
  }
}
