import { HomeBasketSnapshot } from '@/features/home-basket/domain/models';
import { UpdateItemInput } from '@/features/home-basket/domain/repository';

export function updateShoppingItem(
  snapshot: HomeBasketSnapshot,
  itemId: string,
  input: UpdateItemInput
): HomeBasketSnapshot {
  const item = snapshot.items.find((candidate) => candidate.id === itemId);

  if (!item) {
    throw new Error('That shopping item no longer exists.');
  }

  const name = input.name.trim();

  if (!name) {
    throw new Error('Please enter an item name.');
  }

  return {
    ...snapshot,
    items: snapshot.items.map((candidate) =>
      candidate.id === itemId
        ? {
            ...candidate,
            name,
            quantity: input.quantity.trim() || '1',
            category: input.category,
          }
        : candidate
    ),
  };
}
