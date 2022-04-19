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

import { VerifiableCredential } from './verifiable-credential';

/**
 * A JSON-LD Verifiable Presentation without a proof.
 * https://w3c-ccg.github.io/vc-api/holder.html#operation/provePresentation
 */
export interface Presentation {
  /**
   * The JSON-LD context of the presentation.
   */
  '@context': Array<string | Record<string, any>>;

  /**
   * The ID of the presentation.
   * The id property is optional and MAY be used to provide a unique identifier for the presentation.
   * https://www.w3.org/TR/vc-data-model/#presentations-0
   */
  id?: string;

  /**
   * The JSON-LD type of the presentation.
   */
  type: string[];

  /**
   * The holder - will be ignored if no proof is present since there is no proof of authority over the credentials
   */
  holder?: string;

  /**
   * The Verifiable Credentials
   */
  verifiableCredential: VerifiableCredential[];
}
