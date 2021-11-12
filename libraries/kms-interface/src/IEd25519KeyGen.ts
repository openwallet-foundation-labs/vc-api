import { JWK } from 'jose';

/**
 * An interface to generate Ed25119 keys.
 * Could be implemented by library/package, call to KMS, etc.
 *
 * TODO: See if JsonWebKey type can be used https://www.w3.org/TR/WebCryptoAPI/#JsonWebKey-dictionary
 * https://microsoft.github.io/PowerBI-JavaScript/interfaces/_node_modules_typedoc_node_modules_typescript_lib_lib_dom_d_.jsonwebkey.html
 */
export interface IEd25519KeyGen {
  /**
   * Generate AND store an Ed25119 key pair
   * @returns Ed25119 public key as JWK
   */
  generateEd25119: () => Promise<JWK>;
}
