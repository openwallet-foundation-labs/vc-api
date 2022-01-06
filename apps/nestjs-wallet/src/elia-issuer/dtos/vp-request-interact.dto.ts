import { IsArray } from 'class-validator';

/**
 * The schema for this object is taken from https://github.com/w3c-ccg/vc-api/issues/245
 * Probably makes sense for property to be optional until it is mentioned in the vp-request-spec
 */
export class VpRequestInteractDto {
  @IsArray()
  service: { type: string; serviceEndpoint: string }[];
}
