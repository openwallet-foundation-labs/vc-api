import { EthrDID, EthrDIDFactory } from '@energyweb/ssi-did';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { KeyService } from '../key/key.service';

@Injectable()
export class DIDService {
  private readonly ethrDIDFactory: EthrDIDFactory;

  constructor(
    private keyService: KeyService,
    @InjectRepository(EthrDID)
    private didRepository: Repository<EthrDID>
  ) {
    this.ethrDIDFactory = new EthrDIDFactory(this.keyService);
  }

  public async generateEthrDID(): Promise<EthrDID> {
    const did = await this.ethrDIDFactory.create();
    this.didRepository.save(did);
    return did;
  }

  public async getDID(did: string): Promise<EthrDID> {
    return await this.didRepository.findOne(did);
  }
}
