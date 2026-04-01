import { describe, expect, it } from 'vitest';

import { deleteShoppingItem } from '@/features/home-basket/application/delete-shopping-item';
import { createDemoHomeBasketSnapshot } from '@/features/home-basket/infrastructure/demo/create-demo-home-basket-snapshot';

describe('deleteShoppingItem', () => {
  it('removes an existing item from the active basket', () => {
    const snapshot = createDemoHomeBasketSnapshot(new Date('2026-03-29T09:00:00.000Z'));

    const result = deleteShoppingItem(snapshot, 'item-1');

    expect(result.items.find((item) => item.id === 'item-1')).toBeUndefined();
    expect(result.items).toHaveLength(snapshot.items.length - 1);
  });
});
