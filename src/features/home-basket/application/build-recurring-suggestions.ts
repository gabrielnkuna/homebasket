import { HomeBasketSnapshot, ShoppingCategory } from '@/features/home-basket/domain/models';

export interface RecurringSuggestion {
  key: string;
  name: string;
  category: ShoppingCategory;
  quantity: string;
  timesPurchased: number;
  lastPurchasedAt: string;
}

export function normalizeShoppingItemName(name: string) {
  return name.trim().toLowerCase().replace(/\s+/g, ' ');
}

export function buildRecurringSuggestions(
  snapshot: HomeBasketSnapshot,
  maxSuggestions = 6
): RecurringSuggestion[] {
  const activeItemKeys = new Set(
    snapshot.items.map((item) => normalizeShoppingItemName(item.name))
  );
  const suggestions = new Map<string, RecurringSuggestion>();

  snapshot.trips.forEach((trip) => {
    trip.purchasedItems.forEach((item) => {
      const key = normalizeShoppingItemName(item.name);

      if (!key || activeItemKeys.has(key)) {
        return;
      }

      const existingSuggestion = suggestions.get(key);

      if (!existingSuggestion) {
        suggestions.set(key, {
          key,
          name: item.name,
          category: item.category,
          quantity: item.quantity,
          timesPurchased: 1,
          lastPurchasedAt: trip.completedAt,
        });
        return;
      }

      const shouldRefreshDetails = trip.completedAt > existingSuggestion.lastPurchasedAt;

      suggestions.set(key, {
        ...existingSuggestion,
        name: shouldRefreshDetails ? item.name : existingSuggestion.name,
        category: shouldRefreshDetails ? item.category : existingSuggestion.category,
        quantity: shouldRefreshDetails ? item.quantity : existingSuggestion.quantity,
        timesPurchased: existingSuggestion.timesPurchased + 1,
        lastPurchasedAt: shouldRefreshDetails
          ? trip.completedAt
          : existingSuggestion.lastPurchasedAt,
      });
    });
  });

  return Array.from(suggestions.values())
    .sort((left, right) => {
      if (right.timesPurchased !== left.timesPurchased) {
        return right.timesPurchased - left.timesPurchased;
      }

      return right.lastPurchasedAt.localeCompare(left.lastPurchasedAt);
    })
    .slice(0, maxSuggestions);
}
