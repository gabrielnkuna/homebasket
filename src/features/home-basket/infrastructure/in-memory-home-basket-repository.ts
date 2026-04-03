import { addShoppingItem } from '@/features/home-basket/application/add-shopping-item';
import { normalizeBudgetCycleAnchorDay } from '@/features/home-basket/application/budget-cycle';
import { completeShoppingTrip } from '@/features/home-basket/application/complete-shopping-trip';
import { deleteShoppingItem } from '@/features/home-basket/application/delete-shopping-item';
import {
  addShoppingReminderToBasket,
  createShoppingReminder,
  deleteShoppingReminder,
} from '@/features/home-basket/application/manage-shopping-reminders';
import { toggleShoppingItemStatus } from '@/features/home-basket/application/toggle-shopping-item-status';
import { updateShoppingItem } from '@/features/home-basket/application/update-shopping-item';
import { HomeBasketSnapshot } from '@/features/home-basket/domain/models';
import {
  AddItemInput,
  CompleteTripInput,
  CreateReminderInput,
  HomeBasketRepository,
  UpdateItemInput,
} from '@/features/home-basket/domain/repository';
import {
  HouseholdSnapshotListener,
  InMemoryHomeBasketDatabase,
} from '@/features/home-basket/infrastructure/demo/create-demo-home-basket-database';
import { normalizeCurrencyCode } from '@/shared/locale/currency-preferences';

function cloneSnapshot(snapshot: HomeBasketSnapshot): HomeBasketSnapshot {
  return {
    household: { ...snapshot.household },
    members: snapshot.members.map((member) => ({ ...member })),
    items: snapshot.items.map((item) => ({ ...item })),
    trips: snapshot.trips.map((trip) => ({
      ...trip,
      purchasedItems: trip.purchasedItems.map((item) => ({ ...item })),
      receipt: trip.receipt ? { ...trip.receipt } : undefined,
    })),
    reminders: snapshot.reminders.map((reminder) => ({ ...reminder })),
  };
}

function createId(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}

function notifyHousehold(database: InMemoryHomeBasketDatabase, householdId: string) {
  const snapshot = database.households.get(householdId);

  if (!snapshot) {
    return;
  }

  const listeners = database.listeners.get(householdId);

  if (!listeners) {
    return;
  }

  const nextSnapshot = cloneSnapshot(snapshot);
  listeners.forEach((listener) => listener(nextSnapshot));
}

function requireHousehold(database: InMemoryHomeBasketDatabase, householdId: string) {
  const snapshot = database.households.get(householdId);

  if (!snapshot) {
    throw new Error('The household was not found.');
  }

  return snapshot;
}

export function createInMemoryHomeBasketRepository(
  database: InMemoryHomeBasketDatabase
): HomeBasketRepository {
  return {
    subscribe(householdId, listener) {
      const householdListener = listener as HouseholdSnapshotListener;
      const currentListeners = database.listeners.get(householdId) ?? new Set<HouseholdSnapshotListener>();
      currentListeners.add(householdListener);
      database.listeners.set(householdId, currentListeners);

      householdListener(cloneSnapshot(requireHousehold(database, householdId)));

      return () => {
        const listeners = database.listeners.get(householdId);
        listeners?.delete(householdListener);
      };
    },
    async updateCurrencyCode(householdId, currencyCode: string) {
      const snapshot = requireHousehold(database, householdId);
      database.households.set(householdId, {
        ...snapshot,
        household: {
          ...snapshot.household,
          currencyCode: normalizeCurrencyCode(currencyCode),
        },
      });
      notifyHousehold(database, householdId);
    },
    async updateBudgetCycleAnchorDay(householdId, budgetCycleAnchorDay: number) {
      const snapshot = requireHousehold(database, householdId);
      database.households.set(householdId, {
        ...snapshot,
        household: {
          ...snapshot.household,
          budgetCycleAnchorDay: normalizeBudgetCycleAnchorDay(budgetCycleAnchorDay),
        },
      });
      notifyHousehold(database, householdId);
    },
    async updateMonthlyBudget(householdId, monthlyBudgetCents: number) {
      const snapshot = requireHousehold(database, householdId);
      database.households.set(householdId, {
        ...snapshot,
        household: {
          ...snapshot.household,
          monthlyBudgetCents: Math.max(monthlyBudgetCents, 0),
        },
      });
      notifyHousehold(database, householdId);
    },
    async addItem(householdId, input: AddItemInput) {
      const snapshot = requireHousehold(database, householdId);
      database.households.set(
        householdId,
        addShoppingItem(snapshot, {
          ...input,
          createId: () => createId('item'),
        })
      );
      notifyHousehold(database, householdId);
    },
    async addItemsBatch(householdId, inputs: AddItemInput[]) {
      if (inputs.length === 0) {
        return;
      }

      const snapshot = requireHousehold(database, householdId);
      const nextSnapshot = inputs.reduce(
        (currentSnapshot, input) =>
          addShoppingItem(currentSnapshot, {
            ...input,
            createId: () => createId('item'),
          }),
        snapshot
      );

      database.households.set(householdId, nextSnapshot);
      notifyHousehold(database, householdId);
    },
    async updateItem(householdId, itemId: string, input: UpdateItemInput) {
      const snapshot = requireHousehold(database, householdId);
      database.households.set(householdId, updateShoppingItem(snapshot, itemId, input));
      notifyHousehold(database, householdId);
    },
    async deleteItem(householdId, itemId: string) {
      const snapshot = requireHousehold(database, householdId);
      database.households.set(householdId, deleteShoppingItem(snapshot, itemId));
      notifyHousehold(database, householdId);
    },
    async toggleItemStatus(householdId, itemId: string) {
      const snapshot = requireHousehold(database, householdId);
      database.households.set(householdId, toggleShoppingItemStatus(snapshot, itemId));
      notifyHousehold(database, householdId);
    },
    async completeTrip(householdId, input: CompleteTripInput) {
      const snapshot = requireHousehold(database, householdId);
      database.households.set(
        householdId,
        completeShoppingTrip(snapshot, {
          ...input,
          receipt: input.receipt
            ? {
                downloadUrl: input.receipt.previewUri,
                storagePath: `demo://${householdId}/${Date.now().toString(36)}`,
                fileName: input.receipt.fileName,
                contentType: input.receipt.mimeType,
                uploadedAt: new Date().toISOString(),
              }
            : undefined,
          createId: () => createId('trip'),
        })
      );
      notifyHousehold(database, householdId);
    },
    async createReminder(householdId, input: CreateReminderInput) {
      const snapshot = requireHousehold(database, householdId);
      database.households.set(
        householdId,
        createShoppingReminder(snapshot, {
          ...input,
          createId: () => createId('reminder'),
        })
      );
      notifyHousehold(database, householdId);
    },
    async addReminderToBasket(householdId, reminderId, addedByMemberId) {
      const snapshot = requireHousehold(database, householdId);
      database.households.set(
        householdId,
        addShoppingReminderToBasket(snapshot, {
          reminderId,
          addedByMemberId,
          createItemId: () => createId('item'),
        })
      );
      notifyHousehold(database, householdId);
    },
    async deleteReminder(householdId, reminderId) {
      const snapshot = requireHousehold(database, householdId);
      database.households.set(householdId, deleteShoppingReminder(snapshot, reminderId));
      notifyHousehold(database, householdId);
    },
  };
}
