import { HomeBasketSnapshot } from '@/features/home-basket/domain/models';
import { AddItemInput } from '@/features/home-basket/domain/repository';

function createItemFingerprint(item: {
  name: string;
  quantity: string;
  category: string;
}) {
  return `${item.name.trim().toLowerCase()}|${item.quantity.trim().toLowerCase()}|${item.category.trim().toLowerCase()}`;
}

export function buildTripItemsBackToBasketInput(options: {
  snapshot: HomeBasketSnapshot;
  tripId: string;
  addedByMemberId: string;
}): AddItemInput[] {
  const trip = options.snapshot.trips.find((candidate) => candidate.id === options.tripId);

  if (!trip) {
    throw new Error('That purchase no longer exists.');
  }

  const activeFingerprints = new Set(
    options.snapshot.items.map((item) => createItemFingerprint(item))
  );
  const queuedFingerprints = new Set<string>();

  return trip.purchasedItems.flatMap((item) => {
    const fingerprint = createItemFingerprint(item);

    if (activeFingerprints.has(fingerprint) || queuedFingerprints.has(fingerprint)) {
      return [];
    }

    queuedFingerprints.add(fingerprint);

    return [
      {
        name: item.name,
        quantity: item.quantity,
        category: item.category,
        addedByMemberId: options.addedByMemberId,
      },
    ];
  });
}
