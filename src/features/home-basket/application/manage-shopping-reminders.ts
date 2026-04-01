import { addShoppingItem } from '@/features/home-basket/application/add-shopping-item';
import {
  HomeBasketSnapshot,
  ReminderCadence,
  ShoppingReminder,
} from '@/features/home-basket/domain/models';
import { CreateReminderInput } from '@/features/home-basket/domain/repository';
import { parseDateInputValue } from '@/shared/format/date';

type CreateShoppingReminderOptions = CreateReminderInput & {
  createdAt?: string;
  createId?: () => string;
};

type AddReminderToBasketOptions = {
  reminderId: string;
  addedByMemberId: string;
  now?: string;
  createItemId?: () => string;
};

function advanceReminderDueDate(referenceDateIso: string, cadence: ReminderCadence) {
  const nextDate = new Date(referenceDateIso);

  switch (cadence) {
    case 'weekly':
      nextDate.setUTCDate(nextDate.getUTCDate() + 7);
      break;
    case 'fortnightly':
      nextDate.setUTCDate(nextDate.getUTCDate() + 14);
      break;
    case 'monthly':
      nextDate.setUTCMonth(nextDate.getUTCMonth() + 1);
      break;
  }

  return nextDate.toISOString();
}

export function createShoppingReminder(
  snapshot: HomeBasketSnapshot,
  input: CreateShoppingReminderOptions
): HomeBasketSnapshot {
  const title = input.title.trim();
  const nextDueAt = parseDateInputValue(input.nextDueAt);

  if (!title) {
    throw new Error('Enter a reminder title.');
  }

  if (!nextDueAt) {
    throw new Error('Enter the next due date as YYYY-MM-DD.');
  }

  const createdAt = input.createdAt ?? new Date().toISOString();
  const reminder: ShoppingReminder = {
    id: input.createId?.() ?? `reminder-${createdAt}`,
    title,
    quantity: input.quantity.trim() || '1',
    category: input.category,
    cadence: input.cadence,
    nextDueAt,
    createdByMemberId: input.createdByMemberId,
    createdAt,
    note: input.note?.trim() || undefined,
  };

  return {
    ...snapshot,
    reminders: [...snapshot.reminders, reminder].sort((left, right) =>
      left.nextDueAt.localeCompare(right.nextDueAt)
    ),
  };
}

export function addShoppingReminderToBasket(
  snapshot: HomeBasketSnapshot,
  input: AddReminderToBasketOptions
): HomeBasketSnapshot {
  const reminder = snapshot.reminders.find((candidate) => candidate.id === input.reminderId);

  if (!reminder) {
    throw new Error('That reminder no longer exists.');
  }

  const now = input.now ?? new Date().toISOString();
  const nextDueAt = advanceReminderDueDate(now, reminder.cadence);
  const nextSnapshot = addShoppingItem(snapshot, {
    name: reminder.title,
    quantity: reminder.quantity,
    category: reminder.category,
    addedByMemberId: input.addedByMemberId,
    note: reminder.note,
    now,
    createId: input.createItemId,
  });

  return {
    ...nextSnapshot,
    reminders: nextSnapshot.reminders
      .map((candidate) =>
        candidate.id === reminder.id
          ? {
              ...candidate,
              nextDueAt,
              lastAddedAt: now,
            }
          : candidate
      )
      .sort((left, right) => left.nextDueAt.localeCompare(right.nextDueAt)),
  };
}

export function deleteShoppingReminder(
  snapshot: HomeBasketSnapshot,
  reminderId: string
): HomeBasketSnapshot {
  return {
    ...snapshot,
    reminders: snapshot.reminders.filter((reminder) => reminder.id !== reminderId),
  };
}
