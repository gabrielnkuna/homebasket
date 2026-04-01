import { describe, expect, it } from 'vitest';

import { buildDashboard } from '@/features/home-basket/application/build-dashboard';
import { createDemoHomeBasketSnapshot } from '@/features/home-basket/infrastructure/demo/create-demo-home-basket-snapshot';

describe('buildDashboard', () => {
  it('calculates budget-cycle spend, remaining budget, and completion rate', () => {
    const referenceDate = new Date('2026-03-29T09:00:00.000Z');
    const snapshot = createDemoHomeBasketSnapshot(referenceDate);

    const result = buildDashboard(snapshot, referenceDate);

    expect(result.pendingItemsCount).toBe(4);
    expect(result.boughtItemsCount).toBe(2);
    expect(result.budgetCycleSpendCents).toBe(184500);
    expect(result.budgetRemainingCents).toBe(335500);
    expect(result.completionRate).toBeCloseTo(2 / 6);
    expect(result.budgetCycleCategorySpend).toEqual([
      {
        category: 'Dairy',
        estimatedSpendCents: 92250,
        purchasedItemsCount: 1,
        tripsCount: 1,
        shareOfBudgetCycleSpend: 0.5,
      },
      {
        category: 'Pantry',
        estimatedSpendCents: 92250,
        purchasedItemsCount: 1,
        tripsCount: 1,
        shareOfBudgetCycleSpend: 0.5,
      },
    ]);
  });
});
