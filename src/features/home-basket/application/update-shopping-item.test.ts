import { describe, expect, it } from 'vitest';

import { updateShoppingItem } from '@/features/home-basket/application/update-shopping-item';
import { createDemoHomeBasketSnapshot } from '@/features/home-basket/infrastructure/demo/create-demo-home-basket-snapshot';

describe('updateShoppingItem', () => {
  it('updates the name, quantity, and category of an existing item', () => {
    const snapshot = createDemoHomeBasketSnapshot(new Date('2026-03-29T09:00:00.000Z'));

    const result = updateShoppingItem(snapshot, 'item-1', {
      name: 'Brown bread large',
      quantity: '3 loaves',
      category: 'Pantry',
    });

    expect(result.items.find((item) => item.id === 'item-1')).toMatchObject({
      name: 'Brown bread large',
      quantity: '3 loaves',
      category: 'Pantry',
    });
  });
});
