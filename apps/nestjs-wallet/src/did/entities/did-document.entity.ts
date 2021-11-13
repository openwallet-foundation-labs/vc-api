import { Entity, Column, ManyToOne, OneToMany } from 'typeorm';
import { VerificationMethodEntity } from './verification-method.entity';

/**
 * A TypeOrm entity representing a DID Document
 * Should conform to https://www.w3.org/TR/did-core
 */
@Entity()
export class DIDDocumentEntity {
  /**
   * From https://www.w3.org/TR/did-core/#did-subject :
   * "The DID for a particular DID subject is expressed using the id property in the DID document.
   *  The value of id MUST be a string that conforms to the rules in § 3.1 DID Syntax"
   */
  @Column('text', { primary: true })
  id: string;

  /**
   * From: https://www.w3.org/TR/did-core/#verification-methods :
   * "A DID document can express verification methods, such as cryptographic public keys,
   *  which can be used to authenticate or authorize interactions with the DID subject or associated parties.
   *  For example, a cryptographic public key can be used as a verification method with respect to a digital signature;"
   */
  @OneToMany((type) => VerificationMethodEntity, (verificationMethod) => verificationMethod.didDoc, {
    cascade: true
  })
  verificationMethod: VerificationMethodEntity[];
}
