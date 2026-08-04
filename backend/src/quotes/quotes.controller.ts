import {
  Body,
  Controller,
  Get,
  Headers,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { CreateQuoteDto } from './dto/quote.dto';
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

  @Post()
  createQuote(
    @Headers('x-user-id') userId: string,
    @Body() quoteData: CreateQuoteDto,
  ) {
    return this.quotesService.createQuote(
      userId,
      quoteData,
    );
  }

  @Patch(':id')
  updateQuote(
    @Headers('x-user-id') userId: string,
    @Param('id') quoteId: string,
    @Body() quoteData: CreateQuoteDto,
  ) {
    return this.quotesService.updateQuote(
      userId,
      quoteId,
      quoteData,
    );
  }
}