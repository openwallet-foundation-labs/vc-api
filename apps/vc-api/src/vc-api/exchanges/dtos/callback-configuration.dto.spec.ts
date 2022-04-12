import { validate } from 'class-validator';
import { CallbackConfigurationDto } from './callback-configuration.dto';

describe('CallbackConfigurationDto', () => {
  it('should allow a URL that is a localhost', async () => {
    const dto = new CallbackConfigurationDto();
    dto.url = 'http://localhost:80';
    const result = await validate(dto);
    expect(result).toHaveLength(0);
  });
  it('should allow a URL that is a toplevel domain', async () => {
    const dto = new CallbackConfigurationDto();
    dto.url = 'https://example.com/callback';
    const result = await validate(dto);
    expect(result).toHaveLength(0);
  });
  it('should fail for URL that is not a URL', async () => {
    const dto = new CallbackConfigurationDto();
    dto.url = 'not-a-url';
    const result = await validate(dto);
    expect(result).toHaveLength(1);
  });
});
