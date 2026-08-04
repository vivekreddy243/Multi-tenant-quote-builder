import {
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { QuotesService } from './quotes.service';

describe('QuotesService', () => {
  let service: QuotesService;

  beforeEach(() => {
    service = new QuotesService();
  });

  it('returns only quotes from the user organization', () => {
    const results = service.listQuotes('user-a1');

    expect(results).toHaveLength(1);
    expect(
      results.every(
        (quote) =>
          quote.organizationId === 'org-a',
      ),
    ).toBe(true);
  });

  it('prevents cross-tenant quote access', () => {
    expect(() =>
      service.getQuoteById(
        'user-a1',
        'quote-b1',
      ),
    ).toThrow(NotFoundException);
  });

  it('rejects unknown users', () => {
    expect(() =>
      service.listQuotes('unknown-user'),
    ).toThrow(UnauthorizedException);
  });

  it('calculates server-side totals', () => {
    const result = service.getQuoteById(
      'user-a1',
      'quote-a1',
    );

    expect(result.totals).toEqual({
      quoteSubtotalCents: 27500,
      discountAmountCents: 0,
      taxableAmountCents: 27500,
      taxAmountCents: 2200,
      totalCents: 29700,
    });
  });
});
