/*
 * Copyright 2021 - 2023 Energy Web Foundation
 * SPDX-License-Identifier: Apache-2.0
 */

import { JWK } from 'jose';
import { Entity, Column } from 'typeorm';

/**
 * An entity representing a stored KeyPair
 */
@Entity()
export class KeyPair {
  @Column('text', { primary: true })
  public publicKeyThumbprint: string;

  @Column('simple-json')
  public privateKey: JWK;

  @Column('simple-json')
  public publicKey: JWK;
}
