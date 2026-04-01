import { describe, expect, it } from 'vitest';

import {
  buildTripPurchasedItems,
  createTripPurchasedItemDraft,
  normalizeTripPurchasedItems,
} from '@/features/home-basket/application/trip-purchased-items';

describe('trip purchased items', () => {
  it('creates a clean empty draft item', () => {
    expect(createTripPurchasedItemDraft()).toEqual({
      name: '',
      quantity: '1',
      category: 'Other',
    });
  });

  it('normalizes reviewed receipt items and infers missing categories', () => {
    expect(
      normalizeTripPurchasedItems([
        {
          name: '  potting mix  ',
          quantity: ' 30 l ',
          category: '',
        },
        {
          name: '',
          quantity: '1',
          category: 'Other',
        },
      ])
    ).toEqual([
      {
        name: 'potting mix',
        quantity: '30 l',
        category: 'Gardening',
      },
    ]);
  });

  it('merges bought basket items with reviewed receipt items without duplicating exact matches', () => {
    expect(
      buildTripPurchasedItems({
        boughtItems: [
          {
            id: 'item-1',
            name: 'Milk',
            quantity: '2',
            category: 'Dairy',
          },
        ],
        reviewedItems: [
          {
            name: 'Milk',
            quantity: '2',
            category: 'Dairy',
          },
          {
            name: 'Rose food',
            quantity: '1',
            category: '',
          },
        ],
      })
    ).toEqual([
      {
        id: 'item-1',
        name: 'Milk',
        quantity: '2',
        category: 'Dairy',
      },
      {
        id: 'receipt-item-2',
        name: 'Rose food',
        quantity: '1',
        category: 'Other',
      },
    ]);
  });
});
