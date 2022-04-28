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
 * The interact service types that are both
 * - supported by the wallet app
 * - listed in the VP Request spec https://w3c-ccg.github.io/vp-request-spec/#interaction-types
 */
export enum VpRequestInteractServiceType {
  /**
   * https://w3c-ccg.github.io/vp-request-spec/#unmediated-presentation
   */
  unmediatedPresentation = 'UnmediatedHttpPresentationService2021',

  /**
   * See https://w3c-ccg.github.io/vp-request-spec/#mediated-presentation for background.
   * Note that the specification (as of v0.1, 25-04-2022), refers to "MediatedBrowserPresentationService2021".
   * This [GitHub issue](https://github.com/w3c-ccg/vp-request-spec/issues/17) is open to discuss the usage of Mediated Presentations Services
   */
  mediatedPresentation = 'MediatedHttpPresentationService2021'
}
