import { IKeyGenResult } from '..';

/**
 * An interface to generate Ed25119 keys.
 * Could be implemented by library/package, call to KMS, etc.
 */
export interface IEd25519KeyGen {
  /**
   * Generate AND store an Ed25119 key pair
   * @returns Ed25119 key generation result 
   */
  generateEd25119: () => Promise<IKeyGenResult>;
}
