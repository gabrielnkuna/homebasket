import {
  HomeBasketSnapshot,
  ReminderCadence,
  ReceiptAnalysisItem,
  ShoppingCategory,
  ShoppingItemStatus,
} from '@/features/home-basket/domain/models';

export interface AddItemInput {
  name: string;
  quantity: string;
  category: ShoppingCategory;
  addedByMemberId: string;
  note?: string;
}

export interface UpdateItemInput {
  name: string;
  quantity: string;
  category: ShoppingCategory;
}

export interface TripReceiptUpload {
  base64: string;
  previewUri: string;
  fileName: string;
  mimeType: string;
}

export interface CompleteTripInput {
  store: string;
  shopperMemberId: string;
  totalSpendCents: number;
  note?: string;
  receipt?: TripReceiptUpload;
  purchasedItems?: ReceiptAnalysisItem[];
}

export interface CreateReminderInput {
  title: string;
  quantity: string;
  category: ShoppingCategory;
  cadence: ReminderCadence;
  nextDueAt: string;
  createdByMemberId: string;
  note?: string;
}

export interface HomeBasketRepository {
  subscribe(householdId: string, listener: (snapshot: HomeBasketSnapshot) => void): () => void;
  updateCurrencyCode(householdId: string, currencyCode: string): Promise<void>;
  updateBudgetCycleAnchorDay(householdId: string, budgetCycleAnchorDay: number): Promise<void>;
  updateMonthlyBudget(householdId: string, monthlyBudgetCents: number): Promise<void>;
  transferOwnership(
    householdId: string,
    currentOwnerMemberId: string,
    nextOwnerMemberId: string
  ): Promise<void>;
  addItem(householdId: string, input: AddItemInput): Promise<void>;
  addItemsBatch(householdId: string, inputs: AddItemInput[]): Promise<void>;
  updateItem(householdId: string, itemId: string, input: UpdateItemInput): Promise<void>;
  deleteItem(householdId: string, itemId: string): Promise<void>;
  setItemStatus(householdId: string, itemId: string, status: ShoppingItemStatus): Promise<void>;
  toggleItemStatus(householdId: string, itemId: string): Promise<void>;
  completeTrip(householdId: string, input: CompleteTripInput): Promise<void>;
  createReminder(householdId: string, input: CreateReminderInput): Promise<void>;
  addReminderToBasket(
    householdId: string,
    reminderId: string,
    addedByMemberId: string
  ): Promise<void>;
  deleteReminder(householdId: string, reminderId: string): Promise<void>;
}
