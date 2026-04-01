import { describe, expect, it } from 'vitest';

import { buildTripItemsBackToBasketInput } from '@/features/home-basket/application/re-add-trip-items';
import { createDemoHomeBasketSnapshot } from '@/features/home-basket/infrastructure/demo/create-demo-home-basket-snapshot';

describe('buildTripItemsBackToBasketInput', () => {
  it('re-adds trip items that are not already active', () => {
    const snapshot = createDemoHomeBasketSnapshot(new Date('2026-03-29T09:00:00.000Z'));

    expect(
      buildTripItemsBackToBasketInput({
        snapshot,
        tripId: 'trip-1',
        addedByMemberId: 'member-themba',
      })
    ).toEqual([
      {
        name: 'Rice',
        quantity: '5 kg',
        category: 'Pantry',
        addedByMemberId: 'member-themba',
      },
      {
        name: 'Milk',
        quantity: '4 bottles',
        category: 'Dairy',
        addedByMemberId: 'member-themba',
      },
    ]);
  });

  it('skips exact matches that are already active in the basket', () => {
    const snapshot = createDemoHomeBasketSnapshot(new Date('2026-03-29T09:00:00.000Z'));
    const withDuplicateActiveItem = {
      ...snapshot,
      items: [
        ...snapshot.items,
        {
          id: 'active-rice',
          name: 'Rice',
          quantity: '5 kg',
          category: 'Pantry',
          status: 'pending' as const,
          addedByMemberId: 'member-naledi',
          addedAt: '2026-03-29T08:00:00.000Z',
        },
      ],
    };

    expect(
      buildTripItemsBackToBasketInput({
        snapshot: withDuplicateActiveItem,
        tripId: 'trip-1',
        addedByMemberId: 'member-themba',
      })
    ).toEqual([
      {
        name: 'Milk',
        quantity: '4 bottles',
        category: 'Dairy',
        addedByMemberId: 'member-themba',
      },
    ]);
  });
});
