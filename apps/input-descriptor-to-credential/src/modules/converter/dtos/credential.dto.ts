/*
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

import { Credential, CredentialType } from '@ew-did-registry/credentials-interface';
import { ApiProperty } from '@nestjs/swagger';

export class CredentialDto implements Credential<Record<string, unknown>> {
  @ApiProperty()
  '@context': Array<string | Record<string, unknown>>;
  @ApiProperty()
  credentialSubject: Record<string, unknown>;
  @ApiProperty()
  id: string;
  @ApiProperty()
  issuanceDate: string;
  @ApiProperty({ enum: CredentialType, enumName: 'CredentialType', isArray: true })
  type: CredentialType[];
  @ApiProperty()
  issuer: string;
  [x: string]: unknown;

  constructor(props?: Partial<CredentialDto>) {
    Object.assign(this, props);
  }
}
