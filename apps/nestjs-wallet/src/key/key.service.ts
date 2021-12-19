import { Injectable } from '@nestjs/common';
import { IGenerateKey, IGenerateKeyOptions, IKeyDescription } from '@energyweb/w3c-ccg-webkms';
import { generateKeyPair, exportJWK, GenerateKeyPairResult, JWK, calculateJwkThumbprint } from 'jose';
import { InjectRepository } from '@nestjs/typeorm';
import { KeyPair } from './key-pair.entity';
import { Repository } from 'typeorm';
import { keyType } from './key-types';

/**
 * "jose" package is recommended by OpenID developer: https://openid.net/developers/jwt/
 */
@Injectable()
export class KeyService implements IGenerateKey {
  constructor(
    @InjectRepository(KeyPair)
    private keyRepository: Repository<KeyPair>
  ) {}

  async generateKey(options: IGenerateKeyOptions): Promise<IKeyDescription> {
    if (options.type === keyType.secp256k1) {
      return await this.generateSecp256k1();
    }
    if (options.type === keyType.ed25519) {
      return await this.generateEd25119();
    }
    throw new Error(`requested key type ${options.type} not supported`);
  }

  /**
   * Get public key for an assymetric key pair.
   *
   * It is probably reasonable that KMS would support returning the public JWK:
   * - E.g. Azure Key Vault `GetKey` returns a `KeyVaultKey` which has a `Key` property which is a JWK
   *   https://docs.microsoft.com/en-us/dotnet/api/azure.security.keyvault.keys.keyvaultkey.key?view=azure-dotnet#Azure_Security_KeyVault_Keys_KeyVaultKey_Key
   *
   * @param keyId Id of the key
   * @returns public JWK corresponding to keyId
   *
   */
  async getPublicKeyFromKeyId(keyId: string): Promise<JWK> {
    const keyPair = await this.keyRepository.findOne(keyId);
    return keyPair?.publicKeyJWK;
  }

  /**
   * Get private key for an asymmetric key pair.
   *
   * It is probably NOT reasonable to expect that KMS would support
   *
   * @param keyId Id of the public key of the key pair
   * @returns private JWK of the key pair
   */
  async getPrivateKeyFromKeyId(keyId: string): Promise<JWK> {
    const keyPair = await this.keyRepository.findOne(keyId);
    return keyPair?.privateKeyJWK;
  }

  private async saveNewKey(keyGenResult: GenerateKeyPairResult): Promise<IKeyDescription> {
    const publicKeyJWK = await exportJWK(keyGenResult.publicKey);
    publicKeyJWK.kid = await calculateJwkThumbprint(publicKeyJWK, 'sha256');
    const privateKeyJWK = await exportJWK(keyGenResult.privateKey);
    const keyEntity = this.keyRepository.create({
      publicKeyJWK,
      privateKeyJWK,
      publicKeyThumbprint: publicKeyJWK.kid
    });
    await this.keyRepository.save(keyEntity);
    return {
      keyId: publicKeyJWK.kid
    };
  }

  private async generateSecp256k1(): Promise<IKeyDescription> {
    const keyGenResult = await generateKeyPair('ES256K');
    return await this.saveNewKey(keyGenResult);
  }

  private async generateEd25119(): Promise<IKeyDescription> {
    // picked 'EdDSA' as 'alg' based on:
    // - https://stackoverflow.com/a/66894047
    // - https://github.com/panva/jose/issues/210
    const keyGenResult = await generateKeyPair('EdDSA');
    return await this.saveNewKey(keyGenResult);
  }
}
