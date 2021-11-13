import { Injectable } from '@nestjs/common';
import { ISecp256k1KeyGen, IEd25519KeyGen, IKeyGenResult } from '@energyweb/ssi-kms-interface';
import { generateKeyPair, exportJWK, JWK, importJWK, KeyLike, calculateJwkThumbprint } from 'jose';
import { generateEd25519Key } from '@spruceid/didkit-wasm-node';
import { InjectRepository } from '@nestjs/typeorm';
import { KeyPair } from './key-pair.entity';
import { Repository } from 'typeorm';

/**
 * "jose" package is recommended by OpenID developer: https://openid.net/developers/jwt/
 */
@Injectable()
export class KeyService implements ISecp256k1KeyGen, IEd25519KeyGen {
  
  constructor(
    @InjectRepository(KeyPair)
    private keyRepository: Repository<KeyPair>
  ) { }

  async generateSecp256k1(): Promise<IKeyGenResult> {
    const keyGenResult = await generateKeyPair('ES256K');
    const publicKeyJWK = await exportJWK(keyGenResult.publicKey);
    const privateKeyJWK = await exportJWK(keyGenResult.privateKey);
    const publicKeyThumbprint = await calculateJwkThumbprint(publicKeyJWK, "sha256");
    const keyEntity = this.keyRepository.create({
      publicKeyJWK,
      privateKeyJWK,
      publicKeyThumbprint
    });
    this.keyRepository.save(keyEntity);
    return {
      publicKeyThumbprint,
      publicKeyJWK
    };
  }

  async generateEd25119(): Promise<IKeyGenResult> {
    const keyString = generateEd25519Key();
    // picked 'EdDSA' as 'alg' based on:
    // - https://stackoverflow.com/a/66894047
    // - https://github.com/panva/jose/issues/210
    const keyLike = await importJWK(JSON.parse(keyString), 'EdDSA');
    const privateKeyJWK = await exportJWK(keyLike);
    const keyEntity = this.keyRepository.create({
      publicKeyJWK,
      privateKeyJWK,
      publicKeyThumbprint
    });
    return ;
  }
}
