import { Injectable } from '@nestjs/common';
import { generateKeyPair, exportJWK, GenerateKeyPairResult, JWK, calculateJwkThumbprint } from 'jose';
import { InjectRepository } from '@nestjs/typeorm';
import { KeyPair } from './key-pair.entity';
import { Repository } from 'typeorm';

/**
 * "jose" package is recommended by OpenID developer: https://openid.net/developers/jwt/
 * TODO: Interface should conform to WebKMS:
 *  - https://w3c-ccg.github.io/webkms/
 *  - https://w3c-ccg.github.io/ld-cryptosuite-registry/
 */
@Injectable()
export class KeyService {
  constructor(
    @InjectRepository(KeyPair)
    private keyRepository: Repository<KeyPair>
  ) {}

  async generateSecp256k1(): Promise<JWK> {
    const keyGenResult = await generateKeyPair('ES256K');
    return await this.saveNewKey(keyGenResult);
  }

  async generateEd25119(): Promise<JWK> {
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

  private async saveNewKey(keyGenResult: GenerateKeyPairResult): Promise<JWK> {
    const publicKeyJWK = await exportJWK(keyGenResult.publicKey);
    publicKeyJWK.kid = await calculateJwkThumbprint(publicKeyJWK, 'sha256');
    const privateKeyJWK = await exportJWK(keyGenResult.privateKey);
    const keyEntity = this.keyRepository.create({
      publicKeyJWK,
      privateKeyJWK,
      publicKeyThumbprint: publicKeyJWK.kid
    });
    await this.keyRepository.save(keyEntity);
    return publicKeyJWK;
  }
}
