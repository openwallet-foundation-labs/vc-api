import { Body, Controller, Param, Post, Put } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { VerifiablePresentationDto } from '../vc-api/dtos/verifiable-presentation.dto';
import { ExchangeResponseDto } from '../vc-api/exchanges/dtos/exchange-response.dto';
import { EliaExchangeService } from './elia-exchange.service';

@ApiTags('elia-exchange')
@Controller('elia-exchange')
export class EliaExchangeController {
  constructor(private eliaExchangeService: EliaExchangeService) {}

  @Post('/exchanges/:exchangeId')
  async initiateExchange(@Param('exchangeId') exchangeId: string): Promise<ExchangeResponseDto> {
    return this.eliaExchangeService.startExchange(exchangeId);
  }

  @Put('/exchanges/:exchangeId/:transactionId')
  async continueExchange(
    @Param('exchangeId') exchangeId: string,
    @Param('transactionId') transactionId: string,
    @Body() presentation: VerifiablePresentationDto
  ): Promise<ExchangeResponseDto> {
    return this.eliaExchangeService.handlePresentation(presentation, transactionId, exchangeId);
  }
}
