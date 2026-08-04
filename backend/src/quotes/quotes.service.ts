import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { quotes, users } from './seed-data';
import { calculateQuoteTotals } from './totals';
import { Quote, User } from './quote.types';

@Injectable()
export class QuotesService {
  private getUserOrThrow(userId: string): User {
    const user = users.find(
      (currentUser) => currentUser.id === userId,
    );

    if (!user) {
      throw new UnauthorizedException('Invalid user');
    }

    return user;
  }

  listQuotes(userId: string): Quote[] {
    const user = this.getUserOrThrow(userId);

    return quotes.filter(
      (quote) =>
        quote.organizationId === user.organizationId,
    );
  }

  getQuoteById(userId: string, quoteId: string) {
    const user = this.getUserOrThrow(userId);

    const quote = quotes.find(
      (currentQuote) =>
        currentQuote.id === quoteId &&
        currentQuote.organizationId ===
          user.organizationId,
    );

    if (!quote) {
      throw new NotFoundException('Quote not found');
    }

    return {
      ...quote,
      totals: calculateQuoteTotals(quote),
    };
  }

  createQuote(
    userId: string,
    quoteData: Omit<Quote, 'id' | 'organizationId'>,
  ) {
    const user = this.getUserOrThrow(userId);

    const newQuote: Quote = {
      ...quoteData,
      id: `quote-${Date.now()}`,
      organizationId: user.organizationId,
    };

    quotes.push(newQuote);

    return {
      ...newQuote,
      totals: calculateQuoteTotals(newQuote),
    };
  }

  updateQuote(
    userId: string,
    quoteId: string,
    quoteData: Omit<Quote, 'id' | 'organizationId'>,
  ) {
    const user = this.getUserOrThrow(userId);

    const quoteIndex = quotes.findIndex(
      (quote) =>
        quote.id === quoteId &&
        quote.organizationId ===
          user.organizationId,
    );

    if (quoteIndex === -1) {
      throw new NotFoundException('Quote not found');
    }

    const updatedQuote: Quote = {
      ...quoteData,
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