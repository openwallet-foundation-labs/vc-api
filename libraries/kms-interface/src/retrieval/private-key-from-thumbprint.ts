import { JWK } from 'jose';

/**
 * An interface that signals that the KMS can provide the private key, given a public key thumbprint to index to it, if has access to it.
 *
 * Some KMS implementations will likely not support this.
 * Examples could include a cloud KMS or a secure hardware element.
 */
export interface IPrivateKeyFromThumbprint {
  /**
   * Given an RFC-7638 thumbprint to the PUBLIC, returns the corresponding PRIVATE key from KMS memory/storage
   * The public key thumbprint is used because it makes sense to uses as an index for both public and private key retrieval
   */
  retrievePrivateKey: (publicKeyThumbprint: string) => Promise<JWK>;
}
