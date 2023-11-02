/*
 * Copyright 2021 - 2023 Energy Web Foundation
 * SPDX-License-Identifier: Apache-2.0
 */

import { BadRequestException, Injectable } from '@nestjs/common';
import { IGenerateKey, IGenerateKeyOptions, IKeyDescription } from '@energyweb/w3c-ccg-webkms';
import {
  generateKeyPair,
  exportJWK,
  GenerateKeyPairResult,
  JWK,
  calculateJwkThumbprint,
  importJWK
} from 'jose';
import { InjectRepository } from '@nestjs/typeorm';
import { KeyPair } from './key-pair.entity';
import { Repository } from 'typeorm';
import { keyType } from './key-types';
import { KeyPairDto } from './dtos/key-pair.dto';
import { KeyDescriptionDto } from './dtos/key-description.dto';

// picked 'EdDSA' as 'alg' based on:
// - https://stackoverflow.com/a/66894047
// - https://github.com/panva/jose/issues/210
const ED25519_ALG = 'EdDSA';

/**
 * "jose" package is recommended by OpenID developer: https://openid.net/developers/jwt/
 */
@Injectable()
export class KeyService implements IGenerateKey {
  constructor(
    @InjectRepository(KeyPair)
    private keyRepository: Repository<KeyPair>
  ) {}

  public async generateKey(options: IGenerateKeyOptions): Promise<IKeyDescription> {
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
  public async getPublicKeyFromKeyId(keyId: string): Promise<JWK> {
    const keyPair = await this.keyRepository.findOneBy({ publicKeyThumbprint: keyId });
    return keyPair?.publicKey;
  }

  /**
   * Get private key for an asymmetric key pair.
   *
   * It is probably NOT reasonable to expect that KMS would support
   *
   * @param keyId Id of the public key of the key pair
   * @returns private JWK of the key pair
   */
  public async getPrivateKeyFromKeyId(keyId: string): Promise<JWK> {
    const keyPair = await this.keyRepository.findOneBy({ publicKeyThumbprint: keyId });
    return keyPair?.privateKey;
  }

  /**
   * Import a key pair
   *
   * Currently only works for Ed25519 key as alg is hardcoded
   * @param key
   * @returns
   */
  public async importKey(key: KeyPairDto): Promise<IKeyDescription> {
    if (key.privateKey.crv !== 'Ed25519' || key.publicKey.crv !== 'Ed25519') {
      throw new BadRequestException('Only Ed25519 keys are supported');
    }
    const privateKey = await importJWK(key.privateKey, ED25519_ALG);
    const publicKey = await importJWK(key.publicKey, ED25519_ALG);
    if ('type' in privateKey && 'type' in publicKey) {
      return await this.saveNewKey({ privateKey, publicKey });
    }
    throw new Error(`importJWK produced incorrect type. public key: ${publicKey}`);
  }

  public async exportKey(keyDescription: KeyDescriptionDto): Promise<KeyPairDto> {
    const keyPair = await this.keyRepository.findOneBy({ publicKeyThumbprint: keyDescription.keyId });
    return keyPair;
  }

  private async saveNewKey(keyGenResult: GenerateKeyPairResult): Promise<IKeyDescription> {
    const publicKeyJWK = await exportJWK(keyGenResult.publicKey);
    publicKeyJWK.kid = await calculateJwkThumbprint(publicKeyJWK, 'sha256');
    const privateKeyJWK = await exportJWK(keyGenResult.privateKey);
    const keyEntity = this.keyRepository.create({
      publicKey: publicKeyJWK,
      privateKey: privateKeyJWK,
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
    const keyGenResult = await generateKeyPair(ED25519_ALG);
    return await this.saveNewKey(keyGenResult);
  }
}
