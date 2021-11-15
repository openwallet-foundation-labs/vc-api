import { DIDEthrFactory, DIDKeyFactory } from '@energyweb/ssi-did';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DIDDocument, VerificationMethod } from 'did-resolver';
import { keyType } from '../key/key-types';
import { Repository } from 'typeorm';
import { KeyService } from '../key/key.service';
import { DIDDocumentEntity } from './entities/did-document.entity';
import { VerificationMethodEntity } from './entities/verification-method.entity';

@Injectable()
export class DIDService {
  constructor(
    private keyService: KeyService,
    @InjectRepository(DIDDocumentEntity)
    private didRepository: Repository<DIDDocumentEntity>,
    @InjectRepository(VerificationMethodEntity)
    private verificationMethodRepository: Repository<VerificationMethodEntity>
  ) {}

  public async generateEthrDID(): Promise<DIDDocument> {
    const keyDescription = await this.keyService.generateKey({ type: keyType.secp256k1 });
    const key = await this.keyService.getPublicKeyFromKeyId(keyDescription.keyId);
    // Need to set kty because it is possibly undefined in 'jose' JWK type
    const difKey = { ...key, kty: 'EC' };
    const didDoc = await DIDEthrFactory.generate(difKey);
    return await this.saveNewDIDDoc(didDoc);
  }

  public async generateKeyDID(): Promise<DIDDocument> {
    const keyDescription = await this.keyService.generateKey({ type: keyType.ed25519 });
    const key = await this.keyService.getPublicKeyFromKeyId(keyDescription.keyId);
    // Need to set kty because it is possibly undefined in 'jose' JWK type
    const difKey = { ...key, kty: 'OKP' };
    const didDoc = await DIDKeyFactory.generate(difKey);
    return await this.saveNewDIDDoc(didDoc);
  }

  public async getDID(did: string): Promise<DIDDocument> {
    return await this.didRepository.findOne(did, { relations: ['verificationMethod'] });
  }

  public async getVerificationMethod(id: string): Promise<VerificationMethod> {
    return await this.verificationMethodRepository.findOne(id);
  }

  /**
   * Assumes a single verification method associated with the new DID Doc.
   * As this is the case for did:ethr and did:key
   */
  private async saveNewDIDDoc(didDoc: DIDDocument): Promise<DIDDocument> {
    const didDocEntity = this.didRepository.create(didDoc);
    if (didDoc.verificationMethod?.length !== 1) {
      throw new Error(`Default DID document for ethr method should contain one verificaiton method. 
                       Found ${didDoc.verificationMethod?.length} methods instead.`);
    }
    const verificationMethod = didDoc.verificationMethod[0];
    if (!verificationMethod.publicKeyJwk) {
      throw new Error(`publickKeyJwk should be set so that we can refer key material`);
    }
    const verificationMethodEntity = this.verificationMethodRepository.create(verificationMethod);
    didDocEntity.verificationMethod = [verificationMethodEntity];
    return await this.didRepository.save(didDocEntity);
  }
}
