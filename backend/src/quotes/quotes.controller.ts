import {
  Controller,
  Get,
  Headers,
  Param,
} from '@nestjs/common';
import { QuotesService } from './quotes.service';

@Controller('quotes')
export class QuotesController {
  constructor(
    private readonly quotesService: QuotesService,
  ) {}

  @Get()
  listQuotes(
    @Headers('x-user-id') userId: string,
  ) {
    return this.quotesService.listQuotes(userId);
  }

  @Get(':id')
  getQuote(
    @Headers('x-user-id') userId: string,
    @Param('id') quoteId: string,
  ) {
    return this.quotesService.getQuoteById(
      userId,
      quoteId,
    );
  }
}