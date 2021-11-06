import { JWK } from 'jose';

/**
 * An interface to generate Secp256k1 keys.
 * Could be implemented by library/package, call to KMS, etc.
 *
 * TODO: See if JsonWebKey type can be used https://www.w3.org/TR/WebCryptoAPI/#JsonWebKey-dictionary
 * https://microsoft.github.io/PowerBI-JavaScript/interfaces/_node_modules_typedoc_node_modules_typescript_lib_lib_dom_d_.jsonwebkey.html
 */
export interface ISecp256k1KeyGen {
  /**
   * Generate AND store an secp256k1 key pair
   * @returns Secp256k1 public key as JWK
   */
  generateSecp256k1: () => Promise<JWK>;
}
