/*
 * Copyright 2021 - 2023 Energy Web Foundation
 * SPDX-License-Identifier: Apache-2.0
 */

import { BadRequestException, Injectable } from '@nestjs/common';
import { IGenerateKey, IGenerateKeyOptions, IKeyDescription } from '@energyweb/w3c-ccg-webkms';
import { Kms } from '@credo-ts/core';
import { KeyEntryObject } from '@openwallet-foundation/askar-shared';
import { generateKeyPair, exportJWK, GenerateKeyPairResult, JWK, importJWK } from 'jose';
import { keyType } from './key-types';
import { KeyPairDto } from './dtos/key-pair.dto';
import { KeyDescriptionDto } from './dtos/key-description.dto';
import { CredoService } from '../credo/credo.service';
import { Base64ToBase58 } from '../utils/crypto.utils';

// picked 'EdDSA' as 'alg' based on:
// - https://stackoverflow.com/a/66894047
// - https://github.com/panva/jose/issues/210
const ED25519_ALG = 'EdDSA';

/**
 * "jose" package is recommended by OpenID developer: https://openid.net/developers/jwt/
 */
@Injectable()
export class KeyService implements IGenerateKey {
  constructor(private readonly credoService: CredoService) {}

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
    try {
      const publicJwk = await this.credoService.agent.kms.getPublicKey({ keyId });
      return publicJwk ? ({ ...publicJwk } as JWK) : undefined;
    } catch (err) {
      // preserve the previous contract of returning undefined for unknown keys
      if (err instanceof Kms.KeyManagementKeyNotFoundError) {
        return undefined;
      }
      throw err;
    }
  }

  /**
   * Get private key for an asymmetric key pair.
   *
   * The Credo KMS API intentionally has no private-key export, so the key
   * pair is read through a raw Askar session (see CredoService).
   *
   * @param keyId Id of the public key of the key pair
   * @returns private JWK of the key pair
   */
  public async getPrivateKeyFromKeyId(keyId: string): Promise<JWK> {
    const keyEntry = await this.fetchKey(keyId);
    return keyEntry
      ? {
          ...(keyEntry.key.jwkSecret as unknown as JWK)
        }
      : undefined;
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
      const publicKeyBase58 = Base64ToBase58(key.publicKey.x);
      const keyExists = await this.getPublicKeyFromKeyId(publicKeyBase58);

      // if key already exists in the wallet
      // returns keyId i.e. publicKeyBase58
      if (keyExists != null) {
        return {
          keyId: publicKeyBase58
        };
      }

      return await this.saveNewKey({ privateKey, publicKey });
    }
    throw new Error(`importJWK produced incorrect type. public key: ${publicKey}`);
  }

  public async exportKey(keyDescription: KeyDescriptionDto): Promise<KeyPairDto> {
    const keyEntry = await this.fetchKey(keyDescription.keyId);
    if (keyEntry) {
      return {
        publicKey: {
          ...(keyEntry.key.jwkPublic as unknown as JWK),
          kid: keyDescription.keyId
        },
        privateKey: {
          ...(keyEntry.key.jwkSecret as unknown as JWK)
        }
      };
    }
    return null;
  }

  private async saveNewKey(keyGenResult: GenerateKeyPairResult): Promise<IKeyDescription> {
    const publicKeyJWK = await exportJWK(keyGenResult.publicKey);
    const privateKeyJWK = await exportJWK(keyGenResult.privateKey);

    if (!privateKeyJWK.crv || !privateKeyJWK.x) {
      throw new Error('Missing required properties from private JWK');
    }

    // The keyId is the base58 encoding of the (compressed, for EC keys)
    // public key, which keeps the REST API keyId contract from the
    // pre-KMS (Credo 0.5 / askar wallet) implementation
    const keyId = this.keyIdForPublicJwk(publicKeyJWK);

    const { keyId: insertedKeyId } = await this.credoService.agent.kms.importKey({
      privateJwk: {
        ...privateKeyJWK,
        kid: keyId
      } as Kms.KmsJwkPrivate
    });

    return {
      keyId: insertedKeyId
    };
  }

  public async fetchKey(keyId: string): Promise<KeyEntryObject | null> {
    return await this.credoService.withAskarSession(
      async (session) => await session.fetchKey({ name: keyId })
    );
  }

  /**
   * Derive the keyId for a public JWK.
   * - Ed25519 (OKP): base58 of the raw public key
   * - secp256k1 (EC): base58 of the compressed public key
   */
  private keyIdForPublicJwk(publicKeyJWK: JWK): string {
    if (publicKeyJWK.kty === 'OKP') {
      return Base64ToBase58(publicKeyJWK.x);
    }
    if (publicKeyJWK.kty === 'EC' && publicKeyJWK.x && publicKeyJWK.y) {
      const x = Buffer.from(publicKeyJWK.x, 'base64url');
      const y = Buffer.from(publicKeyJWK.y, 'base64url');
      const prefix = y[y.length - 1] % 2 === 0 ? 0x02 : 0x03;
      return Base64ToBase58(Buffer.concat([Buffer.from([prefix]), x]).toString('base64'));
    }
    throw new Error(`cannot derive keyId for JWK with kty ${publicKeyJWK.kty}`);
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
