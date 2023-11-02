/*
 * Copyright 2021 - 2023 Energy Web Foundation
 * SPDX-License-Identifier: Apache-2.0
 */

import { IKeyDescription } from './key-description';

/**
 * An interface representing webkms generateKey
 * https://w3c-ccg.github.io/webkms/#generatekey-options-map
 */
export interface IGenerateKey {
  /**
   * Generates a new cryptographic key in the keystore.
   * @returns Return the key description of the key
   */
  generateKey: (options: IGenerateKeyOptions) => Promise<IKeyDescription>;
}

/**
 * An interface representing webkms generateKey options
 * https://w3c-ccg.github.io/webkms/#generatekey-options-map
 */
export interface IGenerateKeyOptions {
  /**
   * The key type.
   */
  type: string;
}
