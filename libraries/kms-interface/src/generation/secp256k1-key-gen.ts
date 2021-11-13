import { JWK } from 'jose';

/**
 * An interface to generate Secp256k1 keys.
 * Could be implemented by library/package, call to KMS, etc.
 */
export interface ISecp256k1KeyGen {
  /**
   * Generate AND store an secp256k1 key pair
   * @returns Secp256k1 public JWK, where expectation is that kid is the key thumbprint [RFC7638]
   */
  generateSecp256k1: () => Promise<JWK>;
}
