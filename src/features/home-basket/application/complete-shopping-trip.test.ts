import { describe, expect, it } from 'vitest';

import { completeShoppingTrip } from '@/features/home-basket/application/complete-shopping-trip';
import { createDemoHomeBasketSnapshot } from '@/features/home-basket/infrastructure/demo/create-demo-home-basket-snapshot';

describe('completeShoppingTrip', () => {
  it('moves bought items into a trip and keeps pending items on the list', () => {
    const snapshot = createDemoHomeBasketSnapshot(new Date('2026-03-29T09:00:00.000Z'));

    const result = completeShoppingTrip(snapshot, {
      store: 'Checkers Hyper',
      shopperMemberId: 'member-themba',
      totalSpendCents: 87500,
      completedAt: '2026-03-29T09:45:00.000Z',
      receipt: {
        downloadUrl: 'https://example.com/receipt.jpg',
        storagePath: 'households/demo/trips/trip-new/receipt.jpg',
        fileName: 'receipt.jpg',
        contentType: 'image/jpeg',
        uploadedAt: '2026-03-29T09:45:00.000Z',
      },
      createId: () => 'trip-new',
    });

    expect(result.trips[0]).toMatchObject({
      id: 'trip-new',
      store: 'Checkers Hyper',
      shopperMemberId: 'member-themba',
      totalSpendCents: 87500,
      receipt: {
        downloadUrl: 'https://example.com/receipt.jpg',
        storagePath: 'households/demo/trips/trip-new/receipt.jpg',
        fileName: 'receipt.jpg',
        contentType: 'image/jpeg',
        uploadedAt: '2026-03-29T09:45:00.000Z',
      },
    });
    expect(result.trips[0]?.purchasedItems).toHaveLength(2);
    expect(result.items.every((item) => item.status === 'pending')).toBe(true);
    expect(result.items).toHaveLength(snapshot.items.length - 2);
  });

  it('allows an ad hoc trip when no items are marked as bought', () => {
    const snapshot = createDemoHomeBasketSnapshot(new Date('2026-03-29T09:00:00.000Z'));
    const pendingOnlySnapshot = {
      ...snapshot,
      items: snapshot.items.map((item) => ({ ...item, status: 'pending' as const })),
    };

    const result = completeShoppingTrip(pendingOnlySnapshot, {
      store: 'PnP',
      shopperMemberId: 'member-themba',
      totalSpendCents: 87500,
      completedAt: '2026-03-29T10:15:00.000Z',
      purchasedItems: [
        {
          name: 'Brown bread',
          category: 'Pantry',
          quantity: '1',
        },
        {
          name: 'Tomatoes',
          category: 'Produce',
          quantity: '6',
        },
      ],
    });

    expect(result.trips[0]).toMatchObject({
      store: 'PnP',
      shopperMemberId: 'member-themba',
      totalSpendCents: 87500,
      purchasedItems: [
        {
          name: 'Brown bread',
          category: 'Pantry',
          quantity: '1',
        },
        {
          name: 'Tomatoes',
          category: 'Produce',
          quantity: '6',
        },
      ],
    });
    expect(result.items).toHaveLength(pendingOnlySnapshot.items.length);
  });

  it('appends reviewed receipt items to bought basket items without duplicating exact matches', () => {
    const snapshot = createDemoHomeBasketSnapshot(new Date('2026-03-29T09:00:00.000Z'));

    const result = completeShoppingTrip(snapshot, {
      store: 'PnP',
      shopperMemberId: 'member-themba',
      totalSpendCents: 87500,
      completedAt: '2026-03-29T10:15:00.000Z',
      purchasedItems: [
        {
          name: 'Brown bread',
          category: 'Pantry',
          quantity: '2 loaves',
        },
        {
          name: 'Plant food',
          category: '',
          quantity: '1',
        },
      ],
    });

    expect(result.trips[0]?.purchasedItems).toEqual([
      {
        id: 'item-3',
        name: 'Toothpaste',
        category: 'Toiletries',
        quantity: '2 tubes',
      },
      {
        id: 'item-4',
        name: 'Chicken thighs',
        category: 'Meat',
        quantity: '1 tray',
      },
      {
        id: 'receipt-item-1',
        name: 'Brown bread',
        category: 'Pantry',
        quantity: '2 loaves',
      },
      {
        id: 'receipt-item-2',
        name: 'Plant food',
        category: 'Gardening',
        quantity: '1',
      },
    ]);
  });
});
