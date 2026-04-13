import { buildTripPurchasedItems } from '@/features/home-basket/application/trip-purchased-items';
import {
  HomeBasketSnapshot,
  TripReceipt,
  ShoppingTrip,
} from '@/features/home-basket/domain/models';
import { CompleteTripInput } from '@/features/home-basket/domain/repository';

type CompleteTripOptions = Omit<CompleteTripInput, 'receipt'> & {
  completedAt?: string;
  createId?: () => string;
  receipt?: TripReceipt;
};

export function completeShoppingTrip(
  snapshot: HomeBasketSnapshot,
  input: CompleteTripOptions
): HomeBasketSnapshot {
  const boughtItems = snapshot.items
    .filter((item) => item.status === 'bought')
    .map((item) => ({
      id: item.id,
      name: item.name,
      category: item.category,
      quantity: item.quantity,
    }));
  const finalPurchasedItems = buildTripPurchasedItems({
    boughtItems,
    reviewedItems: input.purchasedItems,
  });
  const hasPurchaseEvidence =
    finalPurchasedItems.length > 0 || Boolean(input.receipt) || input.totalSpendCents > 0;

  if (!hasPurchaseEvidence) {
    throw new Error('Add at least one purchased item, attach a receipt, or enter a total before recording this purchase.');
  }

  const trip: ShoppingTrip = {
    id: input.createId?.() ?? `trip-${input.completedAt ?? new Date().toISOString()}`,
    store: input.store.trim() || snapshot.household.primaryStore || 'Unspecified store',
    shopperMemberId: input.shopperMemberId,
    totalSpendCents: Math.max(input.totalSpendCents, 0),
    completedAt: input.completedAt ?? new Date().toISOString(),
    note: input.note?.trim() || undefined,
    purchasedItems: finalPurchasedItems,
    receipt: input.receipt,
  };

  return {
    ...snapshot,
    items: snapshot.items.filter((item) => item.status !== 'bought'),
    trips: [trip, ...snapshot.trips],
  };
}
