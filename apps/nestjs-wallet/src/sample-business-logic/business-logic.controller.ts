import { Body, Controller, Param, Post, Put } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { VerifiablePresentationDto } from '../vc-api/dtos/verifiable-presentation.dto';
import { ExchangeResponseDto } from '../vc-api/exchanges/dtos/exchange-response.dto';
import { BusinessLogicService } from './business-logic.service';

@ApiTags('business-logic')
@Controller('business-logic')
export class BusinessLogicController {
  constructor(private businessLogicService: BusinessLogicService) {}

  @Post('/exchanges/:exchangeId/:transactionId')
  async processPresentation(
    @Param('exchangeId') exchangeId: string,
    @Param('transactionId') transactionId: string,
    @Body() presentation: VerifiablePresentationDto
  ): Promise<ExchangeResponseDto> {
    return this.businessLogicService.handlePresentation(presentation, transactionId, exchangeId);
  }
}
