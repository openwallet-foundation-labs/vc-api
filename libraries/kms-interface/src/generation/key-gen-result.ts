import { JWK } from "jose";

/**
 * An interface that represents the result of a key generation operation.
 * 
 * The interface doesn't include the private key because some implementations may not have access to it.
 * Examples could include a cloud KMS or a secure hardware element.
 */
export interface IKeyGenResult {
    /**
     * The thumbprint provides a convenient, standard way to refer to the key.
     * https://tools.ietf.org/html/rfc7638
     * 
     * It would be possible to derive the thumbprint from the publicKeyJWK but it is better done by the key generator.
     * This is so that more implementation code related to keys can be encapsulted with the key generation module.
     */
    publicKeyThumbprint: string,

    /**
     * The JWK of the publicKey of the generated key pair. 
     *
     * TODO: See if JsonWebKey type can be used https://www.w3.org/TR/WebCryptoAPI/#JsonWebKey-dictionary
     * https://microsoft.github.io/PowerBI-JavaScript/interfaces/_node_modules_typedoc_node_modules_typescript_lib_lib_dom_d_.jsonwebkey.html
     */
    publicKeyJWK: JWK
}