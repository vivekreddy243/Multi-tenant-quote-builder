import { Organization, Quote, User } from './quote.types';

export const organizations: Organization[] = [
  {
    id: 'org-a',
    name: 'ABC Construction',
  },
  {
    id: 'org-b',
    name: 'XYZ Builders',
  },
];

export const users: User[] = [
  {
    id: 'user-a1',
    name: 'Alice',
    organizationId: 'org-a',
  },
  {
    id: 'user-a2',
    name: 'Aaron',
    organizationId: 'org-a',
  },
  {
    id: 'user-b1',
    name: 'Bob',
    organizationId: 'org-b',
  },
];

export const quotes: Quote[] = [
  {
    id: 'quote-a1',
    organizationId: 'org-a',
    customerName: 'John Smith',
    status: 'draft',
    taxRate: 8,
    sections: [
      {
        id: 'section-a1',
        name: 'Kitchen',
        markupPercentage: 10,
        lineItems: [
          {
            id: 'item-a1',
            description: 'Cabinets',
            quantity: 2,
            unitPriceCents: 10000,
          },
          {
            id: 'item-a2',
            description: 'Installation',
            quantity: 1,
            unitPriceCents: 5000,
          },
        ],
      },
    ],
  },
  {
    id: 'quote-b1',
    organizationId: 'org-b',
    customerName: 'Maria Lopez',
    status: 'sent',
    taxRate: 5,
    sections: [
      {
        id: 'section-b1',
        name: 'Flooring',
        lineItems: [
          {
            id: 'item-b1',
            description: 'Wood flooring',
            quantity: 3,
            unitPriceCents: 2000,
          },
        ],
      },
    ],
  },
];
