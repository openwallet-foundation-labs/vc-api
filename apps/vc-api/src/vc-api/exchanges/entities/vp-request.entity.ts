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

import { Column, Entity } from 'typeorm';
import { VpRequestInteractService } from '../types/vp-request-interact-service';
import { VpRequestQuery } from '../types/vp-request-query';

/**
 * A TypeOrm entity representing a VP Request
 * Should conform to https://w3c-ccg.github.io/vp-request-spec
 */
@Entity()
export class VpRequestEntity {
  /**
   * From https://w3c-ccg.github.io/vp-request-spec/#format :
   * "Challenge that will be digitally signed in the authentication proof
   *  that will be attached to the VerifiablePresentation response"
   */
  @Column('text', { primary: true })
  challenge: string;

  @Column('simple-json')
  query: VpRequestQuery[];

  /**
   * The schema for this property is taken from https://github.com/w3c-ccg/vc-api/issues/245
   */
  @Column('simple-json')
  interact: { service: VpRequestInteractService[] };
}
