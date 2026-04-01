import { describe, expect, it } from 'vitest';

import {
  formatBudgetCycleRange,
  formatOrdinalDay,
  getBudgetCycleWindow,
  isInBudgetCycle,
} from '@/features/home-basket/application/budget-cycle';

describe('budget cycle', () => {
  it('builds a pay-cycle window from the configured anchor day', () => {
    const window = getBudgetCycleWindow(new Date('2026-03-29T09:00:00.000Z'), 25);

    expect(window.startDate.toISOString()).toBe('2026-03-25T00:00:00.000Z');
    expect(window.nextStartDate.toISOString()).toBe('2026-04-25T00:00:00.000Z');
    expect(isInBudgetCycle('2026-03-25T12:00:00.000Z', new Date('2026-03-29T09:00:00.000Z'), 25)).toBe(true);
    expect(isInBudgetCycle('2026-03-24T23:59:59.000Z', new Date('2026-03-29T09:00:00.000Z'), 25)).toBe(false);
  });

  it('rolls anchor days like the 31st to the last valid day of shorter months', () => {
    const window = getBudgetCycleWindow(new Date('2026-02-28T09:00:00.000Z'), 31);

    expect(window.startDate.toISOString()).toBe('2026-02-28T00:00:00.000Z');
    expect(window.nextStartDate.toISOString()).toBe('2026-03-31T00:00:00.000Z');
    expect(isInBudgetCycle('2026-03-30T23:59:59.000Z', new Date('2026-02-28T09:00:00.000Z'), 31)).toBe(true);
    expect(isInBudgetCycle('2026-02-27T23:59:59.000Z', new Date('2026-02-28T09:00:00.000Z'), 31)).toBe(false);
    expect(formatBudgetCycleRange(new Date('2026-02-28T09:00:00.000Z'), 31)).toBe('28 Feb - 30 Mar');
    expect(formatOrdinalDay(31)).toBe('31st');
  });
});
