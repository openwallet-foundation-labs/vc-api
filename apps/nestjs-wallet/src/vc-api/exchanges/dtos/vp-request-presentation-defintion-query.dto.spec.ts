import { validate } from 'class-validator';
import 'reflect-metadata';
import { VpRequestPresentationDefinitionQueryDto } from './vp-request-presentation-defintion-query.dto';

describe('VpRequestPresentationDefinitionQueryDto', () => {
  it('should validate valid presentation definition', async () => {
    const query = new VpRequestPresentationDefinitionQueryDto();
    query.presentationDefinition = {
      id: '286bc1e0-f1bd-488a-a873-8d71be3c690e',
      input_descriptors: [
        {
          id: 'my_pres_definition',
          name: 'My presentation definition'
        }
      ]
    };
    const result = await validate(query);
    expect(result).toHaveLength(0);
  });
  it('should validate invalid presentation definition', async () => {
    const query = new VpRequestPresentationDefinitionQueryDto();
    query.presentationDefinition = {
      //@ts-expect-error
      input_descriptors: 10
    };
    const result = await validate(query);
    expect(result).toHaveLength(1);
  });
});
