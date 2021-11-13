import { IKeyGenResult } from '..';

/**
 * An interface to generate Secp256k1 keys.
 * Could be implemented by library/package, call to KMS, etc.
 */
export interface ISecp256k1KeyGen {
  /**
   * Generate AND store an secp256k1 key pair
   * @returns Secp256k1 key generation result
   */
  generateSecp256k1: () => Promise<IKeyGenResult>;
}
