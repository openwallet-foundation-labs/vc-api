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
 * These should be the credential query types that are both
 * - supported by the wallet app
 * - listed in the VP Request spec https://w3c-ccg.github.io/vp-request-spec/#query-types
 *
 * That said, a "PresentationDefinition" type is proposed here https://github.com/w3c-ccg/vp-request-spec/issues/7
 */
export enum VpRequestQueryType {
  /**
   * https://w3c-ccg.github.io/vp-request-spec/#did-authentication-request
   */
  didAuth = 'DIDAuth',

  /**
   * A presentation definition https://identity.foundation/presentation-exchange/#presentation-definition
   */
  presentationDefinition = 'PresentationDefinition'
}
