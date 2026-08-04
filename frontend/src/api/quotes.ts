import type { Quote } from '../types/quote';

const API_URL = 'http://localhost:3000';

export async function getQuote(
  quoteId: string,
  userId: string,
): Promise<Quote> {
  const response = await fetch(
    `${API_URL}/quotes/${quoteId}`,
    {
      headers: {
        'X-User-Id': userId,
      },
    },
  );

  if (!response.ok) {
    throw new Error('Failed to load quote');
  }

  return response.json();
}

export async function updateQuote(
  quote: Quote,
  userId: string,
): Promise<Quote> {
  const response = await fetch(
    `${API_URL}/quotes/${quote.id}`,
    {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'X-User-Id': userId,
      },
      body: JSON.stringify({
        customerName: quote.customerName,
        status: quote.status,
        sections: quote.sections,
        discount: quote.discount,
        taxRate: quote.taxRate,
      }),
    },
  );

  if (!response.ok) {
    throw new Error('Failed to update quote');
  }

  return response.json();
}