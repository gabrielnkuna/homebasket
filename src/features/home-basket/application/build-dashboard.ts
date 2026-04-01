import { isInBudgetCycle } from '@/features/home-basket/application/budget-cycle';
import {
  CategorySpendInsight,
  DashboardSummary,
  HomeBasketSnapshot,
  ShoppingFilter,
  ShoppingItem,
} from '@/features/home-basket/domain/models';

type CategorySpendAccumulator = {
  estimatedSpendCents: number;
  purchasedItemsCount: number;
  trips: Set<string>;
};

function buildBudgetCycleCategorySpend(
  snapshot: HomeBasketSnapshot,
  referenceDate: Date,
  budgetCycleSpendCents: number
): CategorySpendInsight[] {
  const budgetCycleTrips = snapshot.trips.filter((trip) =>
    isInBudgetCycle(trip.completedAt, referenceDate, snapshot.household.budgetCycleAnchorDay ?? 1)
  );
  const categorySpend = new Map<string, CategorySpendAccumulator>();

  budgetCycleTrips.forEach((trip) => {
    if (trip.purchasedItems.length === 0 || trip.totalSpendCents <= 0) {
      return;
    }

    const estimatedSpendPerItem = trip.totalSpendCents / trip.purchasedItems.length;

    trip.purchasedItems.forEach((item) => {
      const existingCategory = categorySpend.get(item.category) ?? {
        estimatedSpendCents: 0,
        purchasedItemsCount: 0,
        trips: new Set<string>(),
      };

      existingCategory.estimatedSpendCents += estimatedSpendPerItem;
      existingCategory.purchasedItemsCount += 1;
      existingCategory.trips.add(trip.id);
      categorySpend.set(item.category, existingCategory);
    });
  });

  return Array.from(categorySpend.entries())
    .map(([category, value]) => ({
      category,
      estimatedSpendCents: Math.round(value.estimatedSpendCents),
      purchasedItemsCount: value.purchasedItemsCount,
      tripsCount: value.trips.size,
      shareOfBudgetCycleSpend:
        budgetCycleSpendCents === 0
          ? 0
          : Math.min(value.estimatedSpendCents / budgetCycleSpendCents, 1),
    }))
    .sort((left, right) => {
      if (right.estimatedSpendCents !== left.estimatedSpendCents) {
        return right.estimatedSpendCents - left.estimatedSpendCents;
      }

      if (right.purchasedItemsCount !== left.purchasedItemsCount) {
        return right.purchasedItemsCount - left.purchasedItemsCount;
      }

      return left.category.localeCompare(right.category);
    });
}

export function buildDashboard(
  snapshot: HomeBasketSnapshot,
  referenceDate: Date = new Date()
): DashboardSummary {
  const pendingItemsCount = snapshot.items.filter((item) => item.status === 'pending').length;
  const boughtItemsCount = snapshot.items.filter((item) => item.status === 'bought').length;
  const activeCategoryCount = new Set(snapshot.items.map((item) => item.category)).size;
  const budgetCycleSpendCents = snapshot.trips
    .filter((trip) =>
      isInBudgetCycle(trip.completedAt, referenceDate, snapshot.household.budgetCycleAnchorDay ?? 1)
    )
    .reduce((total, trip) => total + trip.totalSpendCents, 0);
  const budgetCycleCategorySpend = buildBudgetCycleCategorySpend(
    snapshot,
    referenceDate,
    budgetCycleSpendCents
  );

  const totalItems = pendingItemsCount + boughtItemsCount;

  return {
    pendingItemsCount,
    boughtItemsCount,
    activeCategoryCount,
    budgetCycleSpendCents,
    budgetRemainingCents: Math.max(
      snapshot.household.monthlyBudgetCents - budgetCycleSpendCents,
      0
    ),
    completionRate: totalItems === 0 ? 0 : boughtItemsCount / totalItems,
    budgetCycleCategorySpend,
  };
}

export function filterShoppingItems(items: ShoppingItem[], filter: ShoppingFilter): ShoppingItem[] {
  if (filter === 'all') {
    return items;
  }

  return items.filter((item) => item.status === filter);
}

export function groupShoppingItemsByCategory(items: ShoppingItem[]) {
  const grouped = new Map<string, ShoppingItem[]>();

  items.forEach((item) => {
    const existingItems = grouped.get(item.category) ?? [];
    grouped.set(item.category, [...existingItems, item]);
  });

  return Array.from(grouped.entries()).map(([category, groupedItems]) => ({
    category,
    items: groupedItems,
  }));
}
