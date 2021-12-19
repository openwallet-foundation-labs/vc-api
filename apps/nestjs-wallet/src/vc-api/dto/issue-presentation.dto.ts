import { ValidateNested } from 'class-validator';
import { IssueOptionsDto } from './issue-options.dto';
import { PresentationDto } from './presentation.dto';

/**
 * DTO which contains presentation and options
 */
export class IssuePresentationDto {
  @ValidateNested()
  presentation: PresentationDto;

  @ValidateNested()
  options: IssueOptionsDto;
}
