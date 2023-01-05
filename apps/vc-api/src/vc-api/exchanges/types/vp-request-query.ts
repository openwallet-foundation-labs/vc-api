/**
 * Copyright 2021 - 2023 Energy Web Foundation
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

import { VpRequestQueryType } from './vp-request-query-type';

/**
 * From https://w3c-ccg.github.io/vp-request-spec/#format :
 * "To make a request for one or more objects wrapped in a Verifiable Presentation,
 *  a client constructs a JSON request describing one or more queries that it wishes to perform from the receiver."
 * "The query type serves as the main extension point mechanism for requests for data in the presentation.
 *  This document defines several common query types."
 */
export interface VpRequestQuery {
  type: VpRequestQueryType;
  credentialQuery: any;
}
