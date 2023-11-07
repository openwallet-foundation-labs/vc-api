/*
 * Copyright 2021 - 2023 Energy Web Foundation
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Copied from Decentralized Identity Foundation (DIF) did-resolver because it is not exported from the package
 * https://github.com/decentralized-identity/did-resolver/blob/d732d6c18d9c5be8d3b810897cf05074f38788eb/src/resolver.ts#L73
 */
export interface DifJsonWebKey {
  alg?: string;
  crv?: string;
  e?: string;
  ext?: boolean;
  key_ops?: string[];
  kid?: string;
  kty: string;
  n?: string;
  use?: string;
  x?: string;
  y?: string;
}
