import { IsString, ValidateNested } from 'class-validator';
import { IssueOptionsDto } from './issue-options.dto';

/**
 * DTO which contains DID holder to authenticate and options
 */
export class AuthenticateDto {
  @IsString()
  did: string;

  @ValidateNested()
  options: IssueOptionsDto;
}
