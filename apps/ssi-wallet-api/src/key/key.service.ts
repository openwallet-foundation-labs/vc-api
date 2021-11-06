import { Injectable } from '@nestjs/common';
import { ISecp256k1KeyGen } from '@energyweb/ssi-kms-interface';
import { generateKeyPair, exportJWK, JWK } from 'jose';

/**
 * "jose" package is recommended by OpenID developer: https://openid.net/developers/jwt/
 */
@Injectable()
export class KeyService implements ISecp256k1KeyGen {
  async generateSecp256k1(): Promise<JWK> {
    const keyGenResult = await generateKeyPair('ES256K');
    // TODO: store in DB
    return exportJWK(keyGenResult.publicKey);
  }
}
