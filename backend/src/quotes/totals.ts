import { Quote } from './quote.types';

export interface QuoteTotals {
  quoteSubtotalCents: number;
  discountAmountCents: number;
  taxableAmountCents: number;
  taxAmountCents: number;
  totalCents: number;
}

export function calculateQuoteTotals(quote: Quote): QuoteTotals {
  const quoteSubtotalCents = quote.sections.reduce((quoteSum, section) => {
    const sectionBaseCents = section.lineItems.reduce(
      (lineSum, item) =>
        lineSum + Math.round(item.quantity * item.unitPriceCents),
      0,
    );

    const markupPercentage = section.markupPercentage ?? 0;

    const markupAmountCents = Math.round(
      sectionBaseCents * (markupPercentage / 100),
    );

    return quoteSum + sectionBaseCents + markupAmountCents;
  }, 0);

  let discountAmountCents = 0;

  if (quote.discount?.type === 'percentage') {
    discountAmountCents = Math.round(
      quoteSubtotalCents * (quote.discount.value / 100),
    );
  }

  if (quote.discount?.type === 'fixed') {
    discountAmountCents = quote.discount.valueCents;
  }

  discountAmountCents = Math.max(
    0,
    Math.min(discountAmountCents, quoteSubtotalCents),
  );

  const taxableAmountCents = quoteSubtotalCents - discountAmountCents;

  const taxAmountCents = Math.round(taxableAmountCents * (quote.taxRate / 100));

  const totalCents = taxableAmountCents + taxAmountCents;

  return {
    quoteSubtotalCents,
    discountAmountCents,
    taxableAmountCents,
    taxAmountCents,
    totalCents,
  };
}
