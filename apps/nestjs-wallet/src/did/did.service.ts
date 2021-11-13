import { EthrDIDFactory } from '@energyweb/ssi-did';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DIDDocument, VerificationMethod } from 'did-resolver';
import { Repository } from 'typeorm';
import { KeyService } from '../key/key.service';
import { DIDDocumentEntity } from './entities/did-document.entity';
import { VerificationMethodEntity } from './entities/verification-method.entity';

@Injectable()
export class DIDService {
  private readonly ethrDIDFactory: EthrDIDFactory;

  constructor(
    private keyService: KeyService,
    @InjectRepository(DIDDocumentEntity)
    private didRepository: Repository<DIDDocumentEntity>,
    @InjectRepository(VerificationMethodEntity)
    private verificationMethodRepository: Repository<VerificationMethodEntity>
  ) {
    this.ethrDIDFactory = new EthrDIDFactory(this.keyService);
  }

  public async generateEthrDID(): Promise<DIDDocument> {
    const didDoc = await this.ethrDIDFactory.generate();
    const didDocEntity = this.didRepository.create(didDoc);
    didDocEntity.verificationMethod = didDoc.verificationMethod
      ? didDoc.verificationMethod.map((verificationMethod: VerificationMethod) => {
          return this.verificationMethodRepository.create(verificationMethod);
        })
      : [];
    return await this.didRepository.save(didDocEntity);
  }

  public async generateKeyDID(): Promise<DIDDocument> {
    const did = await this.ethrDIDFactory.generate();
    this.didRepository.save(did);
    return did;
  }

  public async getDID(did: string): Promise<DIDDocument> {
    return await this.didRepository.findOne(did, { relations: ['verificationMethod'] });
  }

  public async getVerificationMethod(id: string): Promise<VerificationMethod> {
    return await this.verificationMethodRepository.findOne(id);
  }
}
