import { ValidateNested } from 'class-validator';
import { CredentialDto } from './credential.dto';
import { IssueOptionsDto } from './issue-options.dto';

/**
 * DTO which contains credential and options
 */
export class IssueDto {
  @ValidateNested()
  credential: CredentialDto;

  @ValidateNested()
  options: IssueOptionsDto;
}
