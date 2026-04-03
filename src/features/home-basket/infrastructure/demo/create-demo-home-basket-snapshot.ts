import { HomeBasketSnapshot } from '@/features/home-basket/domain/models';
import { getDefaultCurrencyCode } from '@/shared/locale/currency-preferences';

export const HOME_BASKET_HOUSEHOLD_ID = 'home-basket-household';
export const HOME_BASKET_DEMO_INVITE_CODE = 'HB-DEMO-2026';

function daysAgo(referenceDate: Date, days: number) {
  return new Date(referenceDate.getTime() - days * 24 * 60 * 60 * 1000).toISOString();
}

export function createDemoHomeBasketSnapshot(
  referenceDate: Date = new Date()
): HomeBasketSnapshot {
  return {
    household: {
      id: HOME_BASKET_HOUSEHOLD_ID,
      name: 'Home Basket',
      currencyCode: getDefaultCurrencyCode(),
      primaryStore: 'Checkers Hyper',
      shopperOfWeekMemberId: 'member-themba',
      monthlyBudgetCents: 520000,
      budgetCycleAnchorDay: 25,
    },
    members: [
      {
        id: 'member-naledi',
        name: 'Naledi',
        initials: 'NA',
        role: 'House lead',
      },
      {
        id: 'member-themba',
        name: 'Themba',
        initials: 'TH',
        role: 'Primary shopper',
      },
      {
        id: 'member-lindiwe',
        name: 'Lindiwe',
        initials: 'LI',
        role: 'Home helper',
      },
    ],
    items: [
      {
        id: 'item-1',
        name: 'Brown bread',
        category: 'Pantry',
        quantity: '2 loaves',
        status: 'pending',
        addedByMemberId: 'member-lindiwe',
        addedAt: daysAgo(referenceDate, 1),
      },
      {
        id: 'item-2',
        name: 'Tomatoes',
        category: 'Produce',
        quantity: '1 kg',
        status: 'pending',
        addedByMemberId: 'member-naledi',
        addedAt: daysAgo(referenceDate, 1),
      },
      {
        id: 'item-3',
        name: 'Toothpaste',
        category: 'Toiletries',
        quantity: '2 tubes',
        status: 'bought',
        addedByMemberId: 'member-lindiwe',
        addedAt: daysAgo(referenceDate, 2),
      },
      {
        id: 'item-4',
        name: 'Chicken thighs',
        category: 'Meat',
        quantity: '1 tray',
        status: 'bought',
        addedByMemberId: 'member-themba',
        addedAt: daysAgo(referenceDate, 2),
      },
      {
        id: 'item-5',
        name: 'Bleach',
        category: 'Cleaning',
        quantity: '1 bottle',
        status: 'pending',
        addedByMemberId: 'member-lindiwe',
        addedAt: daysAgo(referenceDate, 3),
      },
      {
        id: 'item-6',
        name: 'Greek yoghurt',
        category: 'Dairy',
        quantity: '6 cups',
        status: 'pending',
        addedByMemberId: 'member-naledi',
        addedAt: daysAgo(referenceDate, 3),
      },
    ],
    trips: [
      {
        id: 'trip-1',
        store: 'Woolworths Food',
        shopperMemberId: 'member-naledi',
        totalSpendCents: 184500,
        completedAt: daysAgo(referenceDate, 4),
        purchasedItems: [
          {
            id: 'trip-1-item-1',
            name: 'Rice',
            category: 'Pantry',
            quantity: '5 kg',
          },
          {
            id: 'trip-1-item-2',
            name: 'Milk',
            category: 'Dairy',
            quantity: '4 bottles',
          },
        ],
      },
      {
        id: 'trip-2',
        store: 'Checkers Hyper',
        shopperMemberId: 'member-themba',
        totalSpendCents: 123700,
        completedAt: daysAgo(referenceDate, 11),
        purchasedItems: [
          {
            id: 'trip-2-item-1',
            name: 'Washing powder',
            category: 'Cleaning',
            quantity: '1 pack',
          },
          {
            id: 'trip-2-item-2',
            name: 'Apples',
            category: 'Produce',
            quantity: '1 bag',
          },
        ],
      },
    ],
    reminders: [
      {
        id: 'reminder-bread',
        title: 'Brown bread',
        quantity: '2 loaves',
        category: 'Pantry',
        cadence: 'weekly',
        nextDueAt: new Date(referenceDate.getTime() - 24 * 60 * 60 * 1000).toISOString(),
        createdByMemberId: 'member-lindiwe',
        createdAt: daysAgo(referenceDate, 8),
        note: 'School lunch stock-up',
        lastAddedAt: daysAgo(referenceDate, 8),
      },
      {
        id: 'reminder-cleaning',
        title: 'Bleach',
        quantity: '1 bottle',
        category: 'Cleaning',
        cadence: 'fortnightly',
        nextDueAt: daysAgo(referenceDate, 0),
        createdByMemberId: 'member-lindiwe',
        createdAt: daysAgo(referenceDate, 14),
      },
      {
        id: 'reminder-dairy',
        title: 'Greek yoghurt',
        quantity: '6 cups',
        category: 'Dairy',
        cadence: 'monthly',
        nextDueAt: new Date(referenceDate.getTime() + 4 * 24 * 60 * 60 * 1000).toISOString(),
        createdByMemberId: 'member-naledi',
        createdAt: daysAgo(referenceDate, 21),
      },
    ],
  };
}
