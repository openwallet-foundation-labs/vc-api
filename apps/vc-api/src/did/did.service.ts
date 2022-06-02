/**
 * Copyright 2021, 2022 Energy Web Foundation
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

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
