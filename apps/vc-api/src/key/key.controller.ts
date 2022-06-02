import { BadRequestException, Body, Controller, Get, HttpStatus, Param, Post, Res } from '@nestjs/common';
import { validate } from 'class-validator';
import { KeyDescriptionDto } from './dtos/key-description.dto';
import { KeyPairDto } from './dtos/key-pair.dto';
import { KeyService } from './key.service';

@Controller('key')
export class KeyController {
  constructor(private keyService: KeyService) {}

  /**
   * Import a key
   * @param body key pair to import
   * @returns KeyDescription of imported key
   */
  @Post()
  async import(@Body() body: KeyPairDto): Promise<KeyDescriptionDto> {
    return await this.keyService.importKey(body);
  }

  @Get('/:keyId')
  async export(@Param('keyId') keyId: string): Promise<KeyPairDto> {
    const keyDescription = new KeyDescriptionDto();
    keyDescription.keyId = keyId;
    try {
      validate(keyDescription);
    } catch (error) {
      throw new BadRequestException(error);
    }
    return await this.keyService.exportKey(keyDescription);
  }
}
