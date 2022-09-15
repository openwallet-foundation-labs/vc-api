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

import { IsArray, IsDateString, IsObject, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * A JSON-LD Verifiable Credential without a proof.
 * https://w3c-ccg.github.io/vc-api/issuer.html#operation/issueCredential
 */
export class CredentialDto {
  [key: string]: unknown;

  @IsArray()
  //TODO: figure out how to define Swagger type correctly
  @ApiProperty({ description: 'The JSON-LD context of the credential.' })
  '@context': Array<string | Record<string, unknown>>;

  @IsString()
  @ApiProperty({ description: 'The ID of the credential.' })
  id: string;

  @IsArray()
  @IsString({ each: true })
  @ApiProperty({ description: 'The JSON-LD type of the credential.' })
  type: string[];

  @IsString()
  @ApiProperty({ description: 'A JSON-LD Verifiable Credential Issuer.' })
  issuer: string;

  @IsDateString()
  @ApiProperty({ description: 'The issuanceDate' })
  issuanceDate: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional({ description: 'The expirationDate' })
  expirationDate?: string;

  @IsObject()
  @ApiProperty({ description: 'The subject' })
  credentialSubject: Record<string, unknown>;
}
