import { describe, expect, it } from 'vitest';

import { normalizeReceiptAnalysis } from '@/features/home-basket/application/normalize-receipt-analysis';

describe('normalizeReceiptAnalysis', () => {
  it('normalizes total spend and item categories', () => {
    const result = normalizeReceiptAnalysis({
      merchantName: 'PnP Midrand',
      totalSpend: 'R 163,26',
      items: [
        {
          name: 'brown bread',
          quantity: '1',
          category: 'pantry',
        },
        {
          name: 'rose food',
          quantity: '2',
          category: 'gardening',
        },
      ],
    });

    expect(result).toEqual({
      merchantName: 'PnP Midrand',
      detectedTotalSpendCents: 16326,
      items: [
        {
          name: 'brown bread',
          quantity: '1',
          category: 'Pantry',
        },
        {
          name: 'rose food',
          quantity: '2',
          category: 'Gardening',
        },
      ],
    });
  });

  it('filters out receipt summary lines', () => {
    const result = normalizeReceiptAnalysis({
      items: [
        { name: 'Subtotal', quantity: '1', category: 'Other' },
        { name: 'VAT', quantity: '1', category: 'Other' },
        { name: 'Milk', quantity: '2', category: 'Dairy' },
      ],
    });

    expect(result.items).toEqual([
      {
        name: 'Milk',
        quantity: '2',
        category: 'Dairy',
      },
    ]);
  });

  it('parses global amount formats and infers categories from receipt lines', () => {
    const result = normalizeReceiptAnalysis({
      merchantName: '  Carrefour City  ',
      totalSpend: 'EUR 1.234,56',
      items: [
        { name: '2 x Bananas', category: 'Other' },
        { name: 'Potting mix 30l', category: '' },
        { name: 'Sparkling water 1.5L', category: '' },
        { name: 'TOTAL DUE', quantity: '1', category: 'Other' },
      ],
    });

    expect(result).toEqual({
      merchantName: 'Carrefour City',
      detectedTotalSpendCents: 123456,
      items: [
        {
          name: 'Bananas',
          quantity: '2',
          category: 'Produce',
        },
        {
          name: 'Potting mix',
          quantity: '30 L',
          category: 'Gardening',
        },
        {
          name: 'Sparkling water',
          quantity: '1.5 L',
          category: 'Beverages',
        },
      ],
    });
  });

  it('falls back to printed total text and ignores subtotal candidates', () => {
    const result = normalizeReceiptAnalysis({
      merchantName: 'PnP',
      totalSpendText: 'TOTAL R 163,26',
      totalCandidates: ['SUBTOTAL R 149,99', 'VAT R 13,27', 'TOTAL R 163,26'],
      items: [],
    });

    expect(result).toEqual({
      merchantName: 'PnP',
      detectedTotalSpendCents: 16326,
      items: [],
    });
  });
});
