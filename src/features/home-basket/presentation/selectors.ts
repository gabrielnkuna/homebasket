import {
  buildDashboard,
  filterShoppingItems,
  groupShoppingItemsByCategory,
} from '@/features/home-basket/application/build-dashboard';
import {
  formatBudgetCycleRange,
  formatOrdinalDay,
} from '@/features/home-basket/application/budget-cycle';
import { buildRecurringSuggestions } from '@/features/home-basket/application/build-recurring-suggestions';
import { normalizeShoppingCategoryLabel } from '@/features/home-basket/application/resolve-shopping-category';
import {
  HomeBasketSnapshot,
  HouseholdMember,
  ShoppingFilter,
  shoppingCategories,
} from '@/features/home-basket/domain/models';

export function getSelectedMember(
  snapshot: HomeBasketSnapshot,
  selectedMemberId: string | null
): HouseholdMember {
  return (
    snapshot.members.find((member) => member.id === selectedMemberId) ??
    snapshot.members.find((member) => member.id === snapshot.household.shopperOfWeekMemberId) ??
    snapshot.members[0]
  );
}

export function buildHouseholdCategoryOptions(snapshot: HomeBasketSnapshot) {
  const categoryOptionsByKey = new Map<string, string>();

  const addCategory = (value: string) => {
    const category = normalizeShoppingCategoryLabel(value);

    if (!category) {
      return;
    }

    categoryOptionsByKey.set(category.toLowerCase(), category);
  };

  shoppingCategories.forEach(addCategory);
  snapshot.items.forEach((item) => addCategory(item.category));
  snapshot.trips.forEach((trip) => {
    trip.purchasedItems.forEach((item) => addCategory(item.category));
  });
  snapshot.reminders.forEach((reminder) => addCategory(reminder.category));

  return Array.from(categoryOptionsByKey.values());
}

export function buildHomeScreenModel(
  snapshot: HomeBasketSnapshot,
  filter: ShoppingFilter,
  selectedMemberId: string | null
) {
  const reminders = snapshot.reminders
    .slice()
    .sort((left, right) => left.nextDueAt.localeCompare(right.nextDueAt));

  return {
    dashboard: buildDashboard(snapshot),
    groupedItems: groupShoppingItemsByCategory(filterShoppingItems(snapshot.items, filter)),
    suggestions: buildRecurringSuggestions(snapshot),
    selectedMember: getSelectedMember(snapshot, selectedMemberId),
    reminders,
    dueReminders: reminders.slice(0, 4),
    categoryOptions: buildHouseholdCategoryOptions(snapshot),
  };
}

export function buildTripsScreenModel(snapshot: HomeBasketSnapshot) {
  const dashboard = buildDashboard(snapshot);
  const readyItems = snapshot.items.filter((item) => item.status === 'bought');
  const tripsWithTotals = snapshot.trips.filter((trip) => trip.totalSpendCents > 0);
  const averageTripSpendCents =
    tripsWithTotals.length === 0
      ? 0
      : Math.round(
          tripsWithTotals.reduce((sum, trip) => sum + trip.totalSpendCents, 0) /
            tripsWithTotals.length
        );

  return {
    dashboard,
    readyItems,
    averageTripSpendCents,
    receiptTripCount: snapshot.trips.filter((trip) => trip.receipt).length,
    budgetCycleRangeLabel: formatBudgetCycleRange(
      new Date(),
      snapshot.household.budgetCycleAnchorDay
    ),
    categoryOptions: buildHouseholdCategoryOptions(snapshot),
  };
}

export function buildHouseholdScreenModel(snapshot: HomeBasketSnapshot) {
  const dashboard = buildDashboard(snapshot);
  const shopperOfWeek = snapshot.members.find(
    (member) => member.id === snapshot.household.shopperOfWeekMemberId
  );

  return {
    dashboard,
    shopperOfWeek,
    reminders: snapshot.reminders
      .slice()
      .sort((left, right) => left.nextDueAt.localeCompare(right.nextDueAt)),
    budgetProgress:
      snapshot.household.monthlyBudgetCents === 0
        ? 0
        : Math.min(
            dashboard.budgetCycleSpendCents / snapshot.household.monthlyBudgetCents,
            1
          ),
    budgetCycleRangeLabel: formatBudgetCycleRange(
      new Date(),
      snapshot.household.budgetCycleAnchorDay
    ),
    budgetCycleAnchorDayLabel: formatOrdinalDay(snapshot.household.budgetCycleAnchorDay),
    categoryOptions: buildHouseholdCategoryOptions(snapshot),
  };
}
