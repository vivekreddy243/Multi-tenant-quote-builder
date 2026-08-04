import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { quotes, users } from './seed-data';
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

  getQuoteById(userId: string, quoteId: string): Quote {
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

    return quote;
  }
}