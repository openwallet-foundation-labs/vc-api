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

/**
 * A JSON-LD Verifiable Credential without a proof.
 * https://w3c-ccg.github.io/vc-api/issuer.html#operation/issueCredential
 */
export interface Credential {
  // Needed to match @sphereon/pex type
  // https://github.com/Sphereon-Opensource/pex/blob/a1f56d6baabf1b0e1e28a08d04ffc97d76863207/lib/types/SSI.types.ts#L87
  [x: string]: unknown;

  '@context': Array<string | Record<string, any>>;

  /**
   * The ID of the credential.
   */
  id: string;

  /**
   * The JSON-LD type of the credential.
   */
  type: string[];

  /**
   * A JSON-LD Verifiable Credential Issuer.
   */
  issuer: string;

  /**
   * The issuanceDate
   */
  issuanceDate: string;

  /**
   * The expirationDate
   */
  expirationDate?: string;

  /**
   * The subject
   */
  credentialSubject: Record<string, unknown>;
}
