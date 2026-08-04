import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateQuoteDto } from './dto/quote.dto';
import { quotes, users } from './seed-data';
import { calculateQuoteTotals } from './totals';
import { Discount, Quote, User } from './quote.types';

@Injectable()
export class QuotesService {
  private getUserOrThrow(userId: string): User {
    const user = users.find((currentUser) => currentUser.id === userId);

    if (!user) {
      throw new UnauthorizedException('Invalid user');
    }

    return user;
  }

  private normalizeDiscount(
    discountDto: CreateQuoteDto['discount'],
  ): Discount | undefined {
    if (!discountDto) {
      return undefined;
    }

    if (discountDto.type === 'percentage') {
      if (discountDto.value === undefined) {
        throw new BadRequestException('Percentage discount requires value');
      }

      return {
        type: 'percentage',
        value: discountDto.value,
      };
    }

    if (discountDto.valueCents === undefined) {
      throw new BadRequestException('Fixed discount requires valueCents');
    }

    return {
      type: 'fixed',
      valueCents: discountDto.valueCents,
    };
  }

  private createQuoteData(
    quoteData: CreateQuoteDto,
  ): Omit<Quote, 'id' | 'organizationId'> {
    return {
      customerName: quoteData.customerName,
      status: quoteData.status,
      sections: quoteData.sections,
      discount: this.normalizeDiscount(quoteData.discount),
      taxRate: quoteData.taxRate,
    };
  }

  listQuotes(userId: string): Quote[] {
    const user = this.getUserOrThrow(userId);

    return quotes.filter(
      (quote) => quote.organizationId === user.organizationId,
    );
  }

  getQuoteById(userId: string, quoteId: string) {
    const user = this.getUserOrThrow(userId);

    const quote = quotes.find(
      (currentQuote) =>
        currentQuote.id === quoteId &&
        currentQuote.organizationId === user.organizationId,
    );

    if (!quote) {
      throw new NotFoundException('Quote not found');
    }

    return {
      ...quote,
      totals: calculateQuoteTotals(quote),
    };
  }

  createQuote(userId: string, quoteData: CreateQuoteDto) {
    const user = this.getUserOrThrow(userId);

    const normalizedData = this.createQuoteData(quoteData);

    const newQuote: Quote = {
      ...normalizedData,
      id: `quote-${Date.now()}`,
      organizationId: user.organizationId,
    };

    quotes.push(newQuote);

    return {
      ...newQuote,
      totals: calculateQuoteTotals(newQuote),
    };
  }

  updateQuote(userId: string, quoteId: string, quoteData: CreateQuoteDto) {
    const user = this.getUserOrThrow(userId);

    const quoteIndex = quotes.findIndex(
      (quote) =>
        quote.id === quoteId && quote.organizationId === user.organizationId,
    );

    if (quoteIndex === -1) {
      throw new NotFoundException('Quote not found');
    }

    const normalizedData = this.createQuoteData(quoteData);

    const updatedQuote: Quote = {
      ...normalizedData,
      id: quoteId,
      organizationId: user.organizationId,
    };

    quotes[quoteIndex] = updatedQuote;

    return {
      ...updatedQuote,
      totals: calculateQuoteTotals(updatedQuote),
    };
  }
}
