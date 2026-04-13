import { describe, expect, it } from 'vitest';

import {
  addShoppingReminderToBasket,
  createShoppingReminder,
  deleteShoppingReminder,
} from '@/features/home-basket/application/manage-shopping-reminders';
import { createDemoHomeBasketSnapshot } from '@/features/home-basket/infrastructure/demo/create-demo-home-basket-snapshot';

describe('manageShoppingReminders', () => {
  it('creates a reminder with a parsed due date', () => {
    const snapshot = createDemoHomeBasketSnapshot(new Date('2026-03-29T09:00:00.000Z'));

    const result = createShoppingReminder(snapshot, {
      title: 'Dog food',
      quantity: '1 bag',
      category: 'Pantry',
      cadence: 'monthly',
      nextDueAt: '2026-04-02',
      createdByMemberId: 'member-naledi',
      note: 'Large pack',
      createdAt: '2026-03-29T09:00:00.000Z',
      createId: () => 'reminder-new',
    });

    expect(result.reminders.find((reminder) => reminder.id === 'reminder-new')).toMatchObject({
      id: 'reminder-new',
      title: 'Dog food',
      quantity: '1 bag',
      cadence: 'monthly',
      createdByMemberId: 'member-naledi',
      note: 'Large pack',
    });
    expect(
      result.reminders.find((reminder) => reminder.id === 'reminder-new')?.nextDueAt
    ).toBe('2026-04-02T12:00:00.000Z');
  });

  it('adds a due reminder to the bottom of the basket and advances its next due date', () => {
    const snapshot = createDemoHomeBasketSnapshot(new Date('2026-03-29T09:00:00.000Z'));

    const result = addShoppingReminderToBasket(snapshot, {
      reminderId: 'reminder-bread',
      addedByMemberId: 'member-themba',
      now: '2026-03-29T10:00:00.000Z',
      createItemId: () => 'item-from-reminder',
    });

    expect(result.items.at(-1)).toMatchObject({
      id: 'item-from-reminder',
      name: 'Brown bread',
      addedByMemberId: 'member-themba',
    });
    expect(result.reminders.find((reminder) => reminder.id === 'reminder-bread')).toMatchObject({
      lastAddedAt: '2026-03-29T10:00:00.000Z',
      nextDueAt: '2026-04-05T10:00:00.000Z',
    });
  });

  it('deletes a reminder cleanly', () => {
    const snapshot = createDemoHomeBasketSnapshot(new Date('2026-03-29T09:00:00.000Z'));

    const result = deleteShoppingReminder(snapshot, 'reminder-cleaning');

    expect(result.reminders.some((reminder) => reminder.id === 'reminder-cleaning')).toBe(false);
  });
});
