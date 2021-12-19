import { IsString } from 'class-validator';

/**
 * Create DID options
 */
export class CreateDidOptionsDto {
  @IsString()
  method: string;
}
