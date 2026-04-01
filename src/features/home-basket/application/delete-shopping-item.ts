import { HomeBasketSnapshot } from '@/features/home-basket/domain/models';

export function deleteShoppingItem(
  snapshot: HomeBasketSnapshot,
  itemId: string
): HomeBasketSnapshot {
  const hasItem = snapshot.items.some((item) => item.id === itemId);

  if (!hasItem) {
    throw new Error('That shopping item no longer exists.');
  }

  return {
    ...snapshot,
    items: snapshot.items.filter((item) => item.id !== itemId),
  };
}
