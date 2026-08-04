export type QuoteStatus = 'draft' | 'sent' | 'accepted';

export type Discount =
  | {
      type: 'percentage';
      value: number;
    }
  | {
      type: 'fixed';
      valueCents: number;
    };

export interface Organization {
  id: string;
  name: string;
}

export interface User {
  id: string;
  name: string;
  organizationId: string;
}

export interface LineItem {
  id: string;
  description: string;
  quantity: number;
  unitPriceCents: number;
}

export interface Section {
  id: string;
  name: string;
  markupPercentage?: number;
  lineItems: LineItem[];
}

export interface Quote {
  id: string;
  organizationId: string;
  customerName: string;
  status: QuoteStatus;
  sections: Section[];
  discount?: Discount;
  taxRate: number;
}
