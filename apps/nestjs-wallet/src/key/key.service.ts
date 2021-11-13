import { Injectable } from '@nestjs/common';
import {
  ISecp256k1KeyGen,
  IEd25519KeyGen,
  IKeyGenResult,
  IPrivateKeyFromThumbprint
} from '@energyweb/ssi-kms-interface';
import { generateKeyPair, exportJWK, calculateJwkThumbprint, GenerateKeyPairResult, JWK } from 'jose';
import { InjectRepository } from '@nestjs/typeorm';
import { KeyPair } from './key-pair.entity';
import { Repository } from 'typeorm';

/**
 * "jose" package is recommended by OpenID developer: https://openid.net/developers/jwt/
 */
@Injectable()
export class KeyService implements ISecp256k1KeyGen, IEd25519KeyGen, IPrivateKeyFromThumbprint {
  constructor(
    @InjectRepository(KeyPair)
    private keyRepository: Repository<KeyPair>
  ) {}

  async generateSecp256k1(): Promise<IKeyGenResult> {
    const keyGenResult = await generateKeyPair('ES256K');
    return await this.saveNewKey(keyGenResult);
  }

  async generateEd25119(): Promise<IKeyGenResult> {
    // picked 'EdDSA' as 'alg' based on:
    // - https://stackoverflow.com/a/66894047
    // - https://github.com/panva/jose/issues/210
    const keyGenResult = await generateKeyPair('EdDSA');
    return await this.saveNewKey(keyGenResult);
  }

  async retrievePrivateKey(publicKeyThumbprint: string): Promise<JWK> {
    const keyPair = await this.keyRepository.findOne(publicKeyThumbprint);
    return keyPair?.privateKeyJWK;
  }

  private async saveNewKey(keyGenResult: GenerateKeyPairResult): Promise<IKeyGenResult> {
    const publicKeyJWK = await exportJWK(keyGenResult.publicKey);
    const privateKeyJWK = await exportJWK(keyGenResult.privateKey);
    const publicKeyThumbprint = await calculateJwkThumbprint(publicKeyJWK, 'sha256');
    const keyEntity = this.keyRepository.create({
      publicKeyJWK,
      privateKeyJWK,
      publicKeyThumbprint
    });
    await this.keyRepository.save(keyEntity);
    return {
      publicKeyThumbprint,
      publicKeyJWK
    };
  }
}
