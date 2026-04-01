import {
  HomeBasketSnapshot,
  ShoppingItem,
} from '@/features/home-basket/domain/models';
import { AddItemInput } from '@/features/home-basket/domain/repository';

type AddShoppingItemOptions = AddItemInput & {
  now?: string;
  createId?: () => string;
};

export function addShoppingItem(
  snapshot: HomeBasketSnapshot,
  input: AddShoppingItemOptions
): HomeBasketSnapshot {
  const name = input.name.trim();

  if (!name) {
    throw new Error('Please enter an item name.');
  }

  const quantity = input.quantity.trim() || '1';
  const now = input.now ?? new Date().toISOString();

  const item: ShoppingItem = {
    id: input.createId?.() ?? `item-${now}`,
    name,
    category: input.category,
    quantity,
    status: 'pending',
    addedByMemberId: input.addedByMemberId,
    addedAt: now,
    note: input.note?.trim() || undefined,
  };

  return {
    ...snapshot,
    items: [item, ...snapshot.items],
  };
}
