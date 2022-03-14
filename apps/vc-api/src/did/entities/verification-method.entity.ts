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

import { DifJsonWebKey } from '@energyweb/ssi-did';
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

  @Column('simple-json')
  publicKeyJwk: DifJsonWebKey;

  /**
   * The DID Documents that reference this verification method
   * In principle, a verification method could be used by many DIDs? (to be confirmed)
   */
  @ManyToOne((type) => DIDDocumentEntity, (didDoc) => didDoc.verificationMethod)
  didDoc: DIDDocumentEntity;
}
