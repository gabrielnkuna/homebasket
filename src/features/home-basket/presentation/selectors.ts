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
import {
  HomeBasketSnapshot,
  HouseholdMember,
  ShoppingFilter,
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
  };
}

export function buildTripsScreenModel(snapshot: HomeBasketSnapshot) {
  const dashboard = buildDashboard(snapshot);
  const readyItems = snapshot.items.filter((item) => item.status === 'bought');
  const averageTripSpendCents =
    snapshot.trips.length === 0
      ? 0
      : Math.round(
          snapshot.trips.reduce((sum, trip) => sum + trip.totalSpendCents, 0) / snapshot.trips.length
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
  };
}
