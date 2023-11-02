/*
 * Copyright 2021 - 2023 Energy Web Foundation
 * SPDX-License-Identifier: Apache-2.0
 */

import { DIDEthrFactory, DIDKeyFactory } from '@energyweb/ssi-did';
import { BadRequestException, Injectable } from '@nestjs/common';
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
    return await this.registerKeyDID(keyDescription.keyId);
  }

  /**
   * Register a did:key for a key which is known to the server.
   *
   * The method is idempotent because did:key DID Document cannot be mutated.
   *
   * @param keyId keyId (JWK thumbprint) of the key stored on the server
   * @returns DID Document of registered DID
   */
  public async registerKeyDID(keyId: string): Promise<DIDDocument> {
    const key = await this.keyService.getPublicKeyFromKeyId(keyId);

    if (!key) {
      throw new BadRequestException(`keyId=${keyId} not found`);
    }

    // Need to set kty because it is possibly undefined in 'jose' JWK type
    const difKey = { ...key, kty: 'OKP' };
    const didDoc = await DIDKeyFactory.generate(difKey);
    return await this.saveNewDIDDoc(didDoc);
  }

  public async getDID(did: string): Promise<DIDDocument> {
    return await this.didRepository.findOne({
      where: { id: did },
      relations: { verificationMethod: true }
    });
  }

  public async getVerificationMethod(id: string): Promise<VerificationMethod> {
    return await this.verificationMethodRepository.findOneBy({ id });
  }

  /**
   * Assumes a single verification method associated with the new DID Doc.
   * As this is the case for did:ethr and did:key.
   * Could be made more robust by looping through verification methods of provided DID Doc.
   */
  private async saveNewDIDDoc(didDoc: DIDDocument): Promise<DIDDocument> {
    const didDocEntity = this.didRepository.create(didDoc);
    if (didDoc.verificationMethod?.length !== 1) {
      throw new Error(`Default DID document for did:ethr and did:key methods should contain one verificaiton method. 
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
