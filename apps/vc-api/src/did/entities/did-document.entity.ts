/**
 * Copyright 2021, 2022 Energy Web Foundation
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

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
