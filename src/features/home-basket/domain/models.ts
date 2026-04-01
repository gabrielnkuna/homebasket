export const shoppingCategories = [
  'Produce',
  'Pantry',
  'Dairy',
  'Meat',
  'Cleaning',
  'Toiletries',
  'Other',
] as const;

export const shoppingFilters = ['all', 'pending', 'bought'] as const;
export const reminderCadences = ['weekly', 'fortnightly', 'monthly'] as const;

export type ShoppingCategory = string;
export type ShoppingFilter = (typeof shoppingFilters)[number];
export type ShoppingItemStatus = 'pending' | 'bought';
export type ReminderCadence = (typeof reminderCadences)[number];

export interface Household {
  id: string;
  name: string;
  currencyCode: string;
  primaryStore: string;
  shopperOfWeekMemberId: string;
  monthlyBudgetCents: number;
  budgetCycleAnchorDay: number;
}

export interface HouseholdMember {
  id: string;
  name: string;
  initials: string;
  role: string;
  authUserId?: string;
}

export interface ShoppingItem {
  id: string;
  name: string;
  category: ShoppingCategory;
  quantity: string;
  status: ShoppingItemStatus;
  addedByMemberId: string;
  addedAt: string;
  note?: string;
}

export interface PurchasedTripItem {
  id: string;
  name: string;
  category: ShoppingCategory;
  quantity: string;
}

export interface ReceiptAnalysisItem {
  name: string;
  category: ShoppingCategory;
  quantity: string;
}

export interface ReceiptAnalysis {
  merchantName?: string;
  detectedTotalSpendCents?: number;
  items: ReceiptAnalysisItem[];
}

export interface TripReceipt {
  downloadUrl: string;
  storagePath: string;
  fileName: string;
  contentType: string;
  uploadedAt: string;
}

export interface ShoppingTrip {
  id: string;
  store: string;
  shopperMemberId: string;
  totalSpendCents: number;
  completedAt: string;
  note?: string;
  purchasedItems: PurchasedTripItem[];
  receipt?: TripReceipt;
}

export interface ShoppingReminder {
  id: string;
  title: string;
  quantity: string;
  category: ShoppingCategory;
  cadence: ReminderCadence;
  nextDueAt: string;
  createdByMemberId: string;
  createdAt: string;
  note?: string;
  lastAddedAt?: string;
}

export interface HomeBasketSnapshot {
  household: Household;
  members: HouseholdMember[];
  items: ShoppingItem[];
  trips: ShoppingTrip[];
  reminders: ShoppingReminder[];
}

export interface CategorySpendInsight {
  category: ShoppingCategory;
  estimatedSpendCents: number;
  purchasedItemsCount: number;
  tripsCount: number;
  shareOfBudgetCycleSpend: number;
}

export interface DashboardSummary {
  pendingItemsCount: number;
  boughtItemsCount: number;
  activeCategoryCount: number;
  budgetCycleSpendCents: number;
  budgetRemainingCents: number;
  completionRate: number;
  budgetCycleCategorySpend: CategorySpendInsight[];
}
