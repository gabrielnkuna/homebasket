import AsyncStorage from '@react-native-async-storage/async-storage';

import { ShoppingItemStatus } from '@/features/home-basket/domain/models';

const PENDING_ITEM_STATUS_STORAGE_KEY = 'homeBasket.pendingItemStatusUpdates.v1';

export type PendingItemStatusUpdate = {
  householdId: string;
  itemId: string;
  status: ShoppingItemStatus;
  updatedAt: string;
};

function isPendingItemStatusUpdate(value: unknown): value is PendingItemStatusUpdate {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const candidate = value as Partial<PendingItemStatusUpdate>;

  return (
    typeof candidate.householdId === 'string' &&
    typeof candidate.itemId === 'string' &&
    (candidate.status === 'pending' || candidate.status === 'bought') &&
    typeof candidate.updatedAt === 'string'
  );
}

async function savePendingItemStatusUpdates(updates: PendingItemStatusUpdate[]) {
  if (updates.length === 0) {
    await AsyncStorage.removeItem(PENDING_ITEM_STATUS_STORAGE_KEY);
    return;
  }

  await AsyncStorage.setItem(PENDING_ITEM_STATUS_STORAGE_KEY, JSON.stringify(updates));
}

export async function loadPendingItemStatusUpdates(): Promise<PendingItemStatusUpdate[]> {
  try {
    const storedValue = await AsyncStorage.getItem(PENDING_ITEM_STATUS_STORAGE_KEY);

    if (!storedValue) {
      return [];
    }

    const parsedValue = JSON.parse(storedValue);

    return Array.isArray(parsedValue)
      ? parsedValue.filter(isPendingItemStatusUpdate)
      : [];
  } catch {
    return [];
  }
}

export async function queuePendingItemStatusUpdate(update: PendingItemStatusUpdate) {
  const existingUpdates = await loadPendingItemStatusUpdates();
  const nextUpdates = existingUpdates.filter(
    (candidate) =>
      candidate.householdId !== update.householdId || candidate.itemId !== update.itemId
  );

  nextUpdates.push(update);
  await savePendingItemStatusUpdates(nextUpdates);
}

export async function removePendingItemStatusUpdate(update: PendingItemStatusUpdate) {
  const existingUpdates = await loadPendingItemStatusUpdates();
  const nextUpdates = existingUpdates.filter(
    (candidate) =>
      candidate.householdId !== update.householdId ||
      candidate.itemId !== update.itemId ||
      candidate.status !== update.status
  );

  await savePendingItemStatusUpdates(nextUpdates);
}
