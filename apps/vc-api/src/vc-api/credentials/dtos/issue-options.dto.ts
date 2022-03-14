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

import { ProofPurpose } from '@sphereon/pex';
import { IsString, IsObject, IsOptional } from 'class-validator';

/**
 * Options for specifying how the LinkedDataProof is created.
 * https://w3c-ccg.github.io/vc-api/issuer.html#operation/issueCredential
 */
export class IssueOptionsDto {
  /**
   * The type of the proof. Default is an appropriate proof type corresponding to the verification method.
   */
  @IsString()
  @IsOptional()
  type?: string;

  /**
   * The URI of the verificationMethod used for the proof. Default assertionMethod URI.
   */
  @IsString()
  verificationMethod: string;

  /**
   * The purpose of the proof. Default 'assertionMethod'.
   */
  @IsString()
  @IsOptional()
  proofPurpose?: ProofPurpose;

  /**
   * The date and time of the proof (with a maximum accuracy in seconds). Default current system time.
   */
  @IsString()
  @IsOptional()
  created?: string;

  /**
   * A challenge provided by the requesting party of the proof. For example 6e62f66e-67de-11eb-b490-ef3eeefa55f2
   */
  @IsString()
  @IsOptional()
  challenge?: string;

  /**
   * The intended domain of validity for the proof. For example website.example
   */
  @IsString()
  @IsOptional()
  domain?: string;

  /**
   * The method of credential status to issue the credential including. If omitted credential status will be included.
   */
  @IsObject()
  @IsOptional()
  credentialStatus?: Record<string, unknown>;
}
