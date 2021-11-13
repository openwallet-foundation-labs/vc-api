import { VerificationMethod } from 'did-resolver';
import { Entity, Column, ManyToOne } from 'typeorm';
import { DIDDocumentEntity } from './did-document.entity';

/**
 * An entity allowing storage of Verification Methods https://www.w3.org/TR/did-core/#verification-methods
 * See https://www.w3.org/TR/did-core/#example-various-verification-method-types for example
 */
@Entity()
export class VerificationMethodEntity implements VerificationMethod {
  /**
   * From https://www.w3.org/TR/did-core/#verification-methods :
   * "It is RECOMMENDED that verification methods that use JWKs [RFC7517] to represent their public keys use the value of kid as their fragment identifier."
   */
  @Column('text', { primary: true })
  id: string;

  /**
   * From https://www.w3.org/TR/did-core/#verification-methods :
   * "The type of a verification method is expected to be used to determine its compatibility with such processes [that apply a verification method]"
   */
  @Column('text')
  type: string;

  /**
   * From https://www.w3.org/TR/did-core/#verification-methods :
   * "The value of the controller property MUST be a string that conforms to the rules in § 3.1 DID Syntax."
   */
  @Column('text')
  controller: string;

  /**
   * The DID Documents that reference this verification method
   * In principle, a verification method could be used by many DIDs? (to be confirmed)
   */
  @ManyToOne((type) => DIDDocumentEntity, (didDoc) => didDoc.verificationMethod)
  public didDoc: DIDDocumentEntity;
}
