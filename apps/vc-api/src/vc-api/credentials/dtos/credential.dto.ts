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

import { IsString, IsDate, IsArray, IsObject, IsOptional, IsJSON } from 'class-validator';

/**
 * A JSON-LD Verifiable Credential without a proof.
 * https://w3c-ccg.github.io/vc-api/issuer.html#operation/issueCredential
 */
export class CredentialDto {
  [key: string]: unknown;

  /**
   * The JSON-LD context of the credential.
   */
  @IsArray()
  '@context': Array<string | Record<string, any>>;

  /**
   * The ID of the credential.
   */
  @IsString()
  id: string;

  /**
   * The JSON-LD type of the credential.
   */
  @IsArray()
  @IsString({ each: true })
  type: string[];

  /**
   * A JSON-LD Verifiable Credential Issuer.
   */
  @IsString()
  issuer: string;

  /**
   * The issuanceDate
   */
  @IsDate()
  issuanceDate: string;

  /**
   * The expirationDate
   */
  @IsString()
  @IsOptional()
  expirationDate?: string;

  /**
   * The subject
   */
  @IsObject()
  credentialSubject: Record<string, unknown>;
}
