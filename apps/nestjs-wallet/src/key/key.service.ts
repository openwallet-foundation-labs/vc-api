import { Injectable } from '@nestjs/common';
import { ISecp256k1KeyGen, IEd25519KeyGen } from '@energyweb/ssi-kms-interface';
import { generateKeyPair, exportJWK, JWK, importJWK, KeyLike } from 'jose';
import { generateEd25519Key } from '@spruceid/didkit-wasm-node';

/**
 * "jose" package is recommended by OpenID developer: https://openid.net/developers/jwt/
 */
@Injectable()
export class KeyService implements ISecp256k1KeyGen, IEd25519KeyGen {
  async generateSecp256k1(): Promise<JWK> {
    const keyGenResult = await generateKeyPair('ES256K');
    // TODO: store in DB
    return exportJWK(keyGenResult.publicKey);
  }

  async generateEd25119(): Promise<JWK> {
    const keyString = generateEd25519Key();
    // picked 'EdDSA' as 'alg' based on:
    // - https://stackoverflow.com/a/66894047
    // - https://github.com/panva/jose/issues/210
    const keyLike = await importJWK(JSON.parse(keyString), 'EdDSA')
    // TODO: store in DB
    return exportJWK(keyLike);
  }
}
