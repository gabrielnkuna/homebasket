import { describe, expect, it } from 'vitest';

import {
  buildRecurringSuggestions,
  normalizeShoppingItemName,
} from '@/features/home-basket/application/build-recurring-suggestions';
import { createDemoHomeBasketSnapshot } from '@/features/home-basket/infrastructure/demo/create-demo-home-basket-snapshot';

describe('normalizeShoppingItemName', () => {
  it('normalizes whitespace and casing for suggestion matching', () => {
    expect(normalizeShoppingItemName('  Full   Cream MILK ')).toBe('full cream milk');
  });
});

describe('buildRecurringSuggestions', () => {
  it('builds recurring suggestions from trip history and excludes active list items', () => {
    const snapshot = createDemoHomeBasketSnapshot(new Date('2026-03-29T09:00:00.000Z'));
    const enrichedSnapshot = {
      ...snapshot,
      trips: [
        {
          ...snapshot.trips[0],
          purchasedItems: [
            ...snapshot.trips[0].purchasedItems,
            {
              id: 'trip-1-item-3',
              name: 'Rice',
              category: 'Pantry' as const,
              quantity: '10 kg',
            },
          ],
        },
        snapshot.trips[1],
      ],
      items: [
        ...snapshot.items,
        {
          id: 'item-rice',
          name: 'Rice',
          category: 'Pantry' as const,
          quantity: '5 kg',
          status: 'pending' as const,
          addedByMemberId: 'member-naledi',
          addedAt: '2026-03-29T08:55:00.000Z',
        },
      ],
    };

    const result = buildRecurringSuggestions(enrichedSnapshot);

    expect(result.map((item) => item.name)).toEqual(['Milk', 'Washing powder', 'Apples']);
  });

  it('prioritizes frequently purchased staples before one-off items', () => {
    const snapshot = createDemoHomeBasketSnapshot(new Date('2026-03-29T09:00:00.000Z'));
    const repeatedMilkSnapshot = {
      ...snapshot,
      trips: [
        ...snapshot.trips,
        {
          id: 'trip-3',
          store: 'Checkers Hyper',
          shopperMemberId: 'member-themba',
          totalSpendCents: 99000,
          completedAt: '2026-03-28T12:00:00.000Z',
          purchasedItems: [
            {
              id: 'trip-3-item-1',
              name: 'Milk',
              category: 'Dairy' as const,
              quantity: '6 bottles',
            },
          ],
        },
      ],
    };

    const result = buildRecurringSuggestions(repeatedMilkSnapshot);

    expect(result[0]).toMatchObject({
      name: 'Milk',
      timesPurchased: 2,
    });
  });
});
