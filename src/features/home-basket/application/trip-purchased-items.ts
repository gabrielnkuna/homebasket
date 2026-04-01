import {
  inferShoppingCategoryFromText,
  normalizeShoppingCategoryLabel,
} from '@/features/home-basket/application/resolve-shopping-category';
import {
  PurchasedTripItem,
  ReceiptAnalysisItem,
  ShoppingCategory,
} from '@/features/home-basket/domain/models';

type TripPurchasedItemCandidate = Partial<ReceiptAnalysisItem>;

type BuiltPurchasedItem = {
  id: string;
  name: string;
  category: ShoppingCategory;
  quantity: string;
};

export function createTripPurchasedItemDraft(): ReceiptAnalysisItem {
  return {
    name: '',
    quantity: '1',
    category: 'Other',
  };
}

function normalizeTripPurchasedItemName(value: unknown) {
  if (typeof value !== 'string') {
    return '';
  }

  return value.trim().replace(/\s+/g, ' ');
}

function normalizeTripPurchasedItemQuantity(value: unknown) {
  if (typeof value !== 'string') {
    return '1';
  }

  const normalizedValue = value.trim().replace(/\s+/g, ' ');

  return normalizedValue || '1';
}

function normalizeTripPurchasedItemCategory(name: string, category: unknown) {
  const normalizedCategory =
    typeof category === 'string' ? normalizeShoppingCategoryLabel(category) : '';

  if (normalizedCategory) {
    return normalizedCategory;
  }

  return inferShoppingCategoryFromText(name) || 'Other';
}

export function normalizeTripPurchasedItem(
  candidate: TripPurchasedItemCandidate
): ReceiptAnalysisItem | null {
  const name = normalizeTripPurchasedItemName(candidate.name);

  if (!name) {
    return null;
  }

  return {
    name,
    quantity: normalizeTripPurchasedItemQuantity(candidate.quantity),
    category: normalizeTripPurchasedItemCategory(name, candidate.category),
  };
}

export function normalizeTripPurchasedItems(
  candidates: TripPurchasedItemCandidate[]
): ReceiptAnalysisItem[] {
  return candidates
    .map((candidate) => normalizeTripPurchasedItem(candidate))
    .filter((candidate): candidate is ReceiptAnalysisItem => candidate !== null);
}

function createPurchasedItemFingerprint(item: {
  name: string;
  quantity: string;
  category: string;
}) {
  return `${item.name.toLowerCase()}|${item.quantity.toLowerCase()}|${item.category.toLowerCase()}`;
}

export function buildTripPurchasedItems(options: {
  boughtItems: PurchasedTripItem[];
  reviewedItems?: TripPurchasedItemCandidate[];
}): PurchasedTripItem[] {
  const normalizedBoughtItems = options.boughtItems
    .map((item) => {
      const normalizedItem = normalizeTripPurchasedItem(item);

      if (!normalizedItem) {
        return null;
      }

      return {
        id: item.id,
        ...normalizedItem,
      } satisfies BuiltPurchasedItem;
    })
    .filter((item): item is BuiltPurchasedItem => item !== null);
  const fingerprints = new Set(
    normalizedBoughtItems.map((item) => createPurchasedItemFingerprint(item))
  );
  const reviewedItems =
    normalizeTripPurchasedItems(options.reviewedItems ?? []).flatMap((item, index) => {
      const fingerprint = createPurchasedItemFingerprint(item);

      if (fingerprints.has(fingerprint)) {
        return [];
      }

      fingerprints.add(fingerprint);

      return [
        {
          id: `receipt-item-${index + 1}`,
          ...item,
        } satisfies BuiltPurchasedItem,
      ];
    });

  return [...normalizedBoughtItems, ...reviewedItems];
}
