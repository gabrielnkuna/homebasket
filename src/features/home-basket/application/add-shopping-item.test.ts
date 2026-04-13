import { describe, expect, it } from 'vitest';

import { addShoppingItem } from '@/features/home-basket/application/add-shopping-item';
import { createDemoHomeBasketSnapshot } from '@/features/home-basket/infrastructure/demo/create-demo-home-basket-snapshot';

describe('addShoppingItem', () => {
  it('creates a trimmed item at the bottom of the list', () => {
    const snapshot = createDemoHomeBasketSnapshot(new Date('2026-03-29T09:00:00.000Z'));

    const result = addShoppingItem(snapshot, {
      name: '  Dish soap  ',
      quantity: ' 1 bottle ',
      category: 'Cleaning',
      addedByMemberId: 'member-lindiwe',
      now: '2026-03-29T09:15:00.000Z',
      createId: () => 'item-new',
    });

    expect(result.items.at(-1)).toMatchObject({
      id: 'item-new',
      name: 'Dish soap',
      quantity: '1 bottle',
      category: 'Cleaning',
      status: 'pending',
    });
    expect(result.items).toHaveLength(snapshot.items.length + 1);
  });

  it('defaults blank quantity to 1', () => {
    const snapshot = createDemoHomeBasketSnapshot(new Date('2026-03-29T09:00:00.000Z'));

    const result = addShoppingItem(snapshot, {
      name: 'Eggs',
      quantity: '   ',
      category: 'Dairy',
      addedByMemberId: 'member-naledi',
      createId: () => 'item-eggs',
    });

    expect(result.items.at(-1)?.quantity).toBe('1');
  });
});
