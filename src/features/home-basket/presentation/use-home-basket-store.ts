import { create } from 'zustand';

import {
  normalizeAccountEmail,
  validateEmailPasswordLinkInput,
  validatePasswordResetEmailInput,
  validateEmailPasswordSignInInput,
} from '@/features/home-basket/application/account-credentials';
import {
  formatOrdinalDay,
  normalizeBudgetCycleAnchorDay,
} from '@/features/home-basket/application/budget-cycle';
import { resolveShoppingCategory } from '@/features/home-basket/application/resolve-shopping-category';
import { buildTripItemsBackToBasketInput } from '@/features/home-basket/application/re-add-trip-items';
import {
  createTripPurchasedItemDraft,
  normalizeTripPurchasedItems,
} from '@/features/home-basket/application/trip-purchased-items';
import {
  HouseholdInvite,
  HouseholdSession,
} from '@/features/home-basket/domain/access-models';
import { HomeBasketAuthSession } from '@/features/home-basket/domain/auth-models';
import {
  HomeBasketSnapshot,
  ReceiptAnalysis,
  ReceiptAnalysisItem,
  ReminderCadence,
  ShoppingCategory,
  ShoppingFilter,
  shoppingFilters,
} from '@/features/home-basket/domain/models';
import {
  createHomeBasketServices,
  RepositoryMode,
} from '@/features/home-basket/infrastructure/create-home-basket-repository';
import {
  clearStoredHouseholdSession,
  loadStoredHouseholdSession,
  saveStoredHouseholdSession,
} from '@/features/home-basket/infrastructure/session-storage';
import { pickTripReceiptImage } from '@/features/home-basket/infrastructure/receipt-image-picker';
import {
  formatCurrencyInputValue,
  parseCurrencyInput,
} from '@/shared/format/currency';
import {
  getDefaultCurrencyCode,
  normalizeCurrencyCode,
} from '@/shared/locale/currency-preferences';
import {
  analyzeReceiptImage,
  canAnalyzeReceipts,
} from '../infrastructure/receipt-analysis';
import { getAdvancedReceiptTranscriptionMessage } from '../infrastructure/receipt-analysis-capabilities';
import { formatDateInputValue, parseDateInputValue } from '@/shared/format/date';

const services = createHomeBasketServices();
const authRepository = services.authRepository;
const accessRepository = services.accessRepository;
const homeBasketRepository = services.homeBasketRepository;
const syncMode = services.mode;
const demoInviteCode = services.demoInviteCode;

const defaultAddItemDraft = {
  name: '',
  quantity: '1',
  category: 'Produce' as ShoppingCategory,
  customCategory: '',
};

const defaultItemEditDraft = {
  name: '',
  quantity: '1',
  category: 'Other' as ShoppingCategory,
};

const defaultTripDraft = {
  store: '',
  totalSpend: '',
  note: '',
  receiptPreviewUri: '',
  receiptBase64: null as string | null,
  receiptMimeType: null as string | null,
  receiptFileName: null as string | null,
  receiptAnalysis: null as ReceiptAnalysis | null,
  purchasedItemsDraft: [] as ReceiptAnalysisItem[],
};

function createDefaultCreateHouseholdDraft() {
  return {
    householdName: '',
    memberName: '',
    currencyCode: getDefaultCurrencyCode(),
    primaryStore: '',
    monthlyBudget: '',
    budgetCycleAnchorDay: '25',
  };
}

const defaultJoinHouseholdDraft = {
  inviteCode: demoInviteCode ?? '',
  memberName: '',
};

const defaultSignInDraft = {
  email: '',
  password: '',
};

const defaultLinkAccountDraft = {
  email: '',
  password: '',
  confirmPassword: '',
};

function createDefaultReminderDraft() {
  const nextWeek = new Date();
  nextWeek.setDate(nextWeek.getDate() + 7);

  return {
    title: '',
    quantity: '1',
    category: 'Pantry' as ShoppingCategory,
    customCategory: '',
    cadence: 'weekly' as ReminderCadence,
    nextDueAt: formatDateInputValue(nextWeek),
    note: '',
  };
}

let unsubscribe: (() => void) | null = null;

type AddItemDraft = typeof defaultAddItemDraft;
type ItemEditDraft = typeof defaultItemEditDraft;
type TripDraft = typeof defaultTripDraft;
type CreateHouseholdDraft = ReturnType<typeof createDefaultCreateHouseholdDraft>;
type JoinHouseholdDraft = typeof defaultJoinHouseholdDraft;
type SignInDraft = typeof defaultSignInDraft;
type LinkAccountDraft = typeof defaultLinkAccountDraft;
type ReminderDraft = ReturnType<typeof createDefaultReminderDraft>;
type OnboardingMode = 'create' | 'join' | 'restore';

type HomeBasketStore = {
  filter: ShoppingFilter;
  syncMode: RepositoryMode;
  demoInviteCode: string | null;
  authSession: HomeBasketAuthSession | null;
  snapshot: HomeBasketSnapshot | null;
  session: HouseholdSession | null;
  invite: HouseholdInvite | null;
  isReady: boolean;
  isBootstrapping: boolean;
  isSaving: boolean;
  isAnalyzingReceipt: boolean;
  error: string | null;
  notice: string | null;
  selectedMemberId: string | null;
  editingItemId: string | null;
  onboardingMode: OnboardingMode;
  addItemDraft: AddItemDraft;
  itemEditDraft: ItemEditDraft;
  tripDraft: TripDraft;
  createHouseholdDraft: CreateHouseholdDraft;
  joinHouseholdDraft: JoinHouseholdDraft;
  signInDraft: SignInDraft;
  linkAccountDraft: LinkAccountDraft;
  reminderDraft: ReminderDraft;
  initialize: () => Promise<void>;
  clearError: () => void;
  setFilter: (filter: ShoppingFilter) => void;
  setSelectedMember: (memberId: string) => void;
  setOnboardingMode: (mode: OnboardingMode) => void;
  updateAddItemDraft: (patch: Partial<AddItemDraft>) => void;
  startEditingItem: (itemId: string) => void;
  cancelEditingItem: () => void;
  updateItemEditDraft: (patch: Partial<ItemEditDraft>) => void;
  updateTripDraft: (patch: Partial<TripDraft>) => void;
  addTripPurchasedItemDraft: () => void;
  updateTripPurchasedItemDraft: (
    index: number,
    patch: Partial<ReceiptAnalysisItem>
  ) => void;
  removeTripPurchasedItemDraft: (index: number) => void;
  applyReceiptDetectedItems: () => void;
  updateCreateHouseholdDraft: (patch: Partial<CreateHouseholdDraft>) => void;
  updateJoinHouseholdDraft: (patch: Partial<JoinHouseholdDraft>) => void;
  updateSignInDraft: (patch: Partial<SignInDraft>) => void;
  updateLinkAccountDraft: (patch: Partial<LinkAccountDraft>) => void;
  updateReminderDraft: (patch: Partial<ReminderDraft>) => void;
  saveCurrencyCode: (currencyCodeInput: string) => Promise<void>;
  saveBudgetCycleAnchorDay: (anchorDayInput: string) => Promise<void>;
  saveMonthlyBudget: (budgetInput: string) => Promise<void>;
  createHousehold: () => Promise<void>;
  joinHousehold: () => Promise<void>;
  signInWithAccount: () => Promise<void>;
  linkAccount: () => Promise<void>;
  sendPasswordReset: (email?: string) => Promise<void>;
  sendVerificationEmail: () => Promise<void>;
  refreshAccountStatus: () => Promise<void>;
  pickTripReceipt: () => Promise<void>;
  analyzeTripReceipt: () => Promise<ReceiptAnalysis | null>;
  clearTripReceipt: () => void;
  createReminder: () => Promise<void>;
  addReminderToBasket: (reminderId: string) => Promise<void>;
  deleteReminder: (reminderId: string) => Promise<void>;
  createInvite: () => Promise<void>;
  signOut: () => Promise<void>;
  addSuggestedItem: (input: {
    name: string;
    quantity: string;
    category: ShoppingCategory;
  }) => Promise<void>;
  addTripItemsBackToBasket: (tripId: string) => Promise<void>;
  addItem: () => Promise<void>;
  saveItemEdits: () => Promise<void>;
  deleteItem: (itemId: string) => Promise<void>;
  toggleItemStatus: (itemId: string) => Promise<void>;
  completeTrip: () => Promise<void>;
};

function resetHouseholdRuntimeState(): Pick<
  HomeBasketStore,
  | 'snapshot'
  | 'session'
  | 'invite'
  | 'selectedMemberId'
  | 'editingItemId'
  | 'addItemDraft'
  | 'itemEditDraft'
  | 'tripDraft'
  | 'reminderDraft'
> {
  return {
    snapshot: null,
    session: null,
    invite: null,
    selectedMemberId: null,
    editingItemId: null,
    addItemDraft: defaultAddItemDraft,
    itemEditDraft: defaultItemEditDraft,
    tripDraft: defaultTripDraft,
    reminderDraft: createDefaultReminderDraft(),
  };
}

function stopSubscription() {
  if (unsubscribe) {
    unsubscribe();
    unsubscribe = null;
  }
}

function toHomeBasketError(error: unknown, fallback: string) {
  return error instanceof Error ? error : new Error(fallback);
}

async function resolveSessionForAuthUser(authSession: HomeBasketAuthSession) {
  const storedSession = await loadStoredHouseholdSession();
  const matchingStoredSession =
    storedSession?.authUserId === authSession.userId ? storedSession : null;
  let restoredSession: HouseholdSession | null = null;
  let restoreError: Error | null = null;

  if (storedSession && storedSession.authUserId !== authSession.userId) {
    await clearStoredHouseholdSession();
  }

  try {
    restoredSession = await accessRepository.restoreSession(authSession.userId);
  } catch (error) {
    restoreError = toHomeBasketError(
      error,
      'Unable to restore the Home Basket account for this device.'
    );
  }

  return {
    restoredSession,
    activeSession: restoredSession ?? matchingStoredSession,
    restoreError,
  };
}

async function activateSession(
  session: HouseholdSession,
  set: (partial: Partial<HomeBasketStore> | ((state: HomeBasketStore) => Partial<HomeBasketStore>)) => void
) {
  stopSubscription();

  set({
    session,
    selectedMemberId: session.memberId,
    isBootstrapping: true,
    error: null,
    notice: null,
  });

  unsubscribe = homeBasketRepository.subscribe(session.householdId, (snapshot) => {
    const preferredMemberId = snapshot.members.find((member) => member.id === session.memberId)?.id;
    const fallbackMemberId = preferredMemberId ?? snapshot.members[0]?.id ?? null;

    set((state) => ({
      snapshot,
      isReady: true,
      isBootstrapping: false,
      error: null,
      notice: null,
      selectedMemberId: snapshot.members.some((member) => member.id === state.selectedMemberId)
        ? state.selectedMemberId
        : fallbackMemberId,
      tripDraft: {
        ...state.tripDraft,
        store: state.tripDraft.store || snapshot.household.primaryStore,
      },
    }));
  });

  const invite = await accessRepository.getLatestInvite(session.householdId);

  set({
    invite,
    session,
    selectedMemberId: session.memberId,
    isReady: true,
    isBootstrapping: false,
    notice: null,
  });

  await saveStoredHouseholdSession(session);
}

export const useHomeBasketStore = create<HomeBasketStore>((set, get) => ({
  filter: shoppingFilters[0],
  syncMode,
  demoInviteCode,
  authSession: null,
  snapshot: null,
  session: null,
  invite: null,
  isReady: false,
  isBootstrapping: false,
  isSaving: false,
  isAnalyzingReceipt: false,
  error: null,
  notice: null,
  selectedMemberId: null,
  editingItemId: null,
  onboardingMode: demoInviteCode ? 'join' : 'create',
  addItemDraft: defaultAddItemDraft,
  itemEditDraft: defaultItemEditDraft,
  tripDraft: defaultTripDraft,
  createHouseholdDraft: createDefaultCreateHouseholdDraft(),
  joinHouseholdDraft: defaultJoinHouseholdDraft,
  signInDraft: defaultSignInDraft,
  linkAccountDraft: defaultLinkAccountDraft,
  reminderDraft: createDefaultReminderDraft(),
  async initialize() {
    if (get().isBootstrapping || get().isReady) {
      return;
    }

    set({ isBootstrapping: true, error: null, notice: null });

    try {
      const authSession = await authRepository.ensureSignedIn();
      const { activeSession, restoredSession, restoreError } =
        await resolveSessionForAuthUser(authSession);

      if (!activeSession) {
        if (restoreError) {
          throw restoreError;
        }

        set({
          ...resetHouseholdRuntimeState(),
          authSession,
        isReady: true,
        isBootstrapping: false,
        notice: null,
        isAnalyzingReceipt: false,
      });
      return;
      }

      await activateSession(activeSession, set);
      if (!restoredSession) {
        void accessRepository.syncSession(activeSession);
      }
      set({ authSession, notice: null });
    } catch (error) {
      await clearStoredHouseholdSession();
      stopSubscription();

      set({
        ...resetHouseholdRuntimeState(),
        authSession: null,
        isReady: true,
        isBootstrapping: false,
        error:
          error instanceof Error
            ? error.message
            : 'Unable to restore the Home Basket session on this device.',
        notice: null,
        isAnalyzingReceipt: false,
      });
    }
  },
  clearError() {
    set({ error: null, notice: null });
  },
  setFilter(filter) {
    set({ filter, error: null, notice: null });
  },
  setSelectedMember(memberId) {
    set({ selectedMemberId: memberId, error: null, notice: null });
  },
  setOnboardingMode(mode) {
    set({ onboardingMode: mode, error: null, notice: null });
  },
  updateAddItemDraft(patch) {
    set((state) => ({
      addItemDraft: {
        ...state.addItemDraft,
        ...patch,
      },
      error: null,
      notice: null,
    }));
  },
  startEditingItem(itemId) {
    const snapshot = get().snapshot;
    const item = snapshot?.items.find((candidate) => candidate.id === itemId);

    if (!item) {
      set({ error: 'That shopping item no longer exists.', notice: null });
      return;
    }

    set({
      editingItemId: itemId,
      itemEditDraft: {
        name: item.name,
        quantity: item.quantity,
        category: item.category,
      },
      error: null,
      notice: null,
    });
  },
  cancelEditingItem() {
    set({
      editingItemId: null,
      itemEditDraft: defaultItemEditDraft,
      error: null,
      notice: null,
    });
  },
  updateItemEditDraft(patch) {
    set((state) => ({
      itemEditDraft: {
        ...state.itemEditDraft,
        ...patch,
      },
      error: null,
      notice: null,
    }));
  },
  updateTripDraft(patch) {
    set((state) => ({
      tripDraft: {
        ...state.tripDraft,
        ...patch,
      },
      error: null,
      notice: null,
    }));
  },
  addTripPurchasedItemDraft() {
    set((state) => ({
      tripDraft: {
        ...state.tripDraft,
        purchasedItemsDraft: [
          ...state.tripDraft.purchasedItemsDraft,
          createTripPurchasedItemDraft(),
        ],
      },
      error: null,
      notice: null,
    }));
  },
  updateTripPurchasedItemDraft(index, patch) {
    set((state) => ({
      tripDraft: {
        ...state.tripDraft,
        purchasedItemsDraft: state.tripDraft.purchasedItemsDraft.map((item, itemIndex) =>
          itemIndex === index
            ? {
                ...item,
                ...patch,
              }
            : item
        ),
      },
      error: null,
      notice: null,
    }));
  },
  removeTripPurchasedItemDraft(index) {
    set((state) => ({
      tripDraft: {
        ...state.tripDraft,
        purchasedItemsDraft: state.tripDraft.purchasedItemsDraft.filter(
          (_, itemIndex) => itemIndex !== index
        ),
      },
      error: null,
      notice: null,
    }));
  },
  applyReceiptDetectedItems() {
    const state = get();
    const detectedItems = normalizeTripPurchasedItems(state.tripDraft.receiptAnalysis?.items ?? []);

    if (detectedItems.length === 0) {
      set({
        error: 'No confident receipt items are ready to apply yet.',
        notice: null,
      });
      return;
    }

    set((currentState) => ({
      tripDraft: {
        ...currentState.tripDraft,
        purchasedItemsDraft: detectedItems,
      },
      error: null,
      notice: `${detectedItems.length} receipt item${detectedItems.length === 1 ? '' : 's'} loaded into the trip review list.`,
    }));
  },
  updateCreateHouseholdDraft(patch) {
    set((state) => ({
      createHouseholdDraft: {
        ...state.createHouseholdDraft,
        ...patch,
      },
      error: null,
      notice: null,
    }));
  },
  updateJoinHouseholdDraft(patch) {
    set((state) => ({
      joinHouseholdDraft: {
        ...state.joinHouseholdDraft,
        ...patch,
      },
      error: null,
      notice: null,
    }));
  },
  updateSignInDraft(patch) {
    set((state) => ({
      signInDraft: {
        ...state.signInDraft,
        ...patch,
      },
      error: null,
      notice: null,
    }));
  },
  updateLinkAccountDraft(patch) {
    set((state) => ({
      linkAccountDraft: {
        ...state.linkAccountDraft,
        ...patch,
      },
      error: null,
      notice: null,
    }));
  },
  updateReminderDraft(patch) {
    set((state) => ({
      reminderDraft: {
        ...state.reminderDraft,
        ...patch,
      },
      error: null,
      notice: null,
    }));
  },
  async saveCurrencyCode(currencyCodeInput) {
    const state = get();
    const snapshot = state.snapshot;

    if (!snapshot || !state.session) {
      return;
    }

    if (state.session.memberRole !== 'Owner') {
      set({
        error: 'Only the household owner can change the currency.',
        notice: null,
      });
      return;
    }

    let currencyCode: string;

    try {
      currencyCode = normalizeCurrencyCode(currencyCodeInput);
    } catch (error) {
      set({
        error:
          error instanceof Error ? error.message : 'Choose a valid household currency.',
        notice: null,
      });
      return;
    }

    try {
      set({ isSaving: true, error: null, notice: null });
      await homeBasketRepository.updateCurrencyCode(snapshot.household.id, currencyCode);
      set({
        isSaving: false,
        error: null,
        notice: `Household currency set to ${currencyCode}.`,
      });
    } catch (error) {
      set({
        isSaving: false,
        error:
          error instanceof Error
            ? error.message
            : 'Unable to update the household currency right now.',
        notice: null,
      });
    }
  },
  async createHousehold() {
    const state = get();
    const monthlyBudgetCents =
      parseCurrencyInput(state.createHouseholdDraft.monthlyBudget) ?? 0;
    let budgetCycleAnchorDay: number;
    let currencyCode: string;

    try {
      budgetCycleAnchorDay = normalizeBudgetCycleAnchorDay(
        Number(state.createHouseholdDraft.budgetCycleAnchorDay)
      );
      currencyCode = normalizeCurrencyCode(state.createHouseholdDraft.currencyCode);
    } catch (error) {
      set({
        error:
          error instanceof Error ? error.message : 'Check the pay day and currency.',
        notice: null,
      });
      return;
    }

    try {
      const authSession = state.authSession ?? (await authRepository.ensureSignedIn());
      set({ isSaving: true, error: null, notice: null });
      const result = await accessRepository.createHousehold({
        householdName: state.createHouseholdDraft.householdName,
        memberName: state.createHouseholdDraft.memberName,
        currencyCode,
        primaryStore: state.createHouseholdDraft.primaryStore,
        monthlyBudgetCents,
        budgetCycleAnchorDay,
      }, authSession);

      await activateSession(result.session, set);

      set({
        authSession,
        invite: result.invite,
        createHouseholdDraft: createDefaultCreateHouseholdDraft(),
        joinHouseholdDraft: {
          ...defaultJoinHouseholdDraft,
          memberName: result.session.memberName,
        },
        notice: null,
        isSaving: false,
      });
    } catch (error) {
      set({
        isSaving: false,
        error:
          error instanceof Error
            ? error.message
            : 'Unable to create the household right now.',
        notice: null,
      });
    }
  },
  async saveBudgetCycleAnchorDay(anchorDayInput) {
    const state = get();
    const snapshot = state.snapshot;

    if (!snapshot || !state.session) {
      return;
    }

    if (state.session.memberRole !== 'Owner') {
      set({
        error: 'Only the household owner can change the pay day cycle.',
        notice: null,
      });
      return;
    }

    try {
      const budgetCycleAnchorDay = normalizeBudgetCycleAnchorDay(Number(anchorDayInput));
      set({ isSaving: true, error: null, notice: null });
      await homeBasketRepository.updateBudgetCycleAnchorDay(
        snapshot.household.id,
        budgetCycleAnchorDay
      );
      set({
        isSaving: false,
        error: null,
        notice: `Budget cycle start moved to the ${formatOrdinalDay(budgetCycleAnchorDay)} of each month.`,
      });
    } catch (error) {
      set({
        isSaving: false,
        error:
          error instanceof Error
            ? error.message
            : 'Unable to update the household pay day right now.',
        notice: null,
      });
    }
  },
  async saveMonthlyBudget(budgetInput) {
    const state = get();
    const snapshot = state.snapshot;

    if (!snapshot || !state.session) {
      return;
    }

    if (state.session.memberRole !== 'Owner') {
      set({
        error: 'Only the household owner can change the monthly budget.',
        notice: null,
      });
      return;
    }

    const monthlyBudgetCents = parseCurrencyInput(budgetInput) ?? 0;

    try {
      set({ isSaving: true, error: null, notice: null });
      await homeBasketRepository.updateMonthlyBudget(
        snapshot.household.id,
        monthlyBudgetCents
      );
      set({
        isSaving: false,
        error: null,
        notice:
          monthlyBudgetCents > 0
            ? `Monthly budget set to ${formatCurrencyInputValue(monthlyBudgetCents)}.`
            : 'Monthly budget turned off for now.',
      });
    } catch (error) {
      set({
        isSaving: false,
        error:
          error instanceof Error
            ? error.message
            : 'Unable to update the monthly budget right now.',
        notice: null,
      });
    }
  },
  async joinHousehold() {
    const state = get();

    try {
      const authSession = state.authSession ?? (await authRepository.ensureSignedIn());
      set({ isSaving: true, error: null, notice: null });
      const session = await accessRepository.joinHousehold({
        inviteCode: state.joinHouseholdDraft.inviteCode,
        memberName: state.joinHouseholdDraft.memberName,
      }, authSession);

      await activateSession(session, set);

      set({
        authSession,
        joinHouseholdDraft: {
          ...defaultJoinHouseholdDraft,
          inviteCode: state.joinHouseholdDraft.inviteCode,
          memberName: session.memberName,
        },
        notice: null,
        isSaving: false,
      });
    } catch (error) {
      set({
        isSaving: false,
        error:
          error instanceof Error ? error.message : 'Unable to join that household right now.',
        notice: null,
      });
    }
  },
  async signInWithAccount() {
    const state = get();
    const validation = validateEmailPasswordSignInInput(state.signInDraft);

    if (validation) {
      set({ error: validation, notice: null });
      return;
    }

    try {
      set({ isSaving: true, error: null, notice: null });
      const authSession = await authRepository.signInWithEmailPassword(state.signInDraft);
      const { activeSession, restoredSession, restoreError } =
        await resolveSessionForAuthUser(authSession);

      if (!activeSession) {
        if (restoreError) {
          throw restoreError;
        }

        stopSubscription();

        set({
          ...resetHouseholdRuntimeState(),
          authSession,
          isReady: true,
          isBootstrapping: false,
          isSaving: false,
          signInDraft: defaultSignInDraft,
          notice: authSession.emailVerified
            ? `Signed in as ${authSession.email ?? normalizeAccountEmail(state.signInDraft.email)}. Create a household or join one with an invite code to continue.`
            : `Signed in as ${authSession.email ?? normalizeAccountEmail(state.signInDraft.email)}. Verify the email from your inbox when you can, then create a household or join one with an invite code.`,
        });
        return;
      }

      await activateSession(activeSession, set);

      if (!restoredSession) {
        void accessRepository.syncSession(activeSession);
      }

      set({
        authSession,
        signInDraft: defaultSignInDraft,
        linkAccountDraft: defaultLinkAccountDraft,
        notice: null,
        isSaving: false,
      });
    } catch (error) {
      set({
        isSaving: false,
        error:
          error instanceof Error
            ? error.message
            : 'Unable to sign in with that Home Basket account right now.',
        notice: null,
      });
    }
  },
  async linkAccount() {
    const state = get();
    const validation = validateEmailPasswordLinkInput(state.linkAccountDraft);

    if (validation) {
      set({ error: validation, notice: null });
      return;
    }

    try {
      set({ isSaving: true, error: null, notice: null });
      const authSession = await authRepository.linkWithEmailPassword(state.linkAccountDraft);
      let verificationSent = false;

      if (state.session) {
        await accessRepository.syncSession({
          ...state.session,
          authUserId: authSession.userId,
        });
      }

      if (!authSession.emailVerified) {
        try {
          await authRepository.sendEmailVerification();
          verificationSent = true;
        } catch {
          verificationSent = false;
        }
      }

      set({
        authSession,
        linkAccountDraft: defaultLinkAccountDraft,
        isSaving: false,
        notice: authSession.emailVerified
          ? `This device is now linked to ${authSession.email ?? normalizeAccountEmail(state.linkAccountDraft.email)}. You can sign in on another browser or phone and Home Basket will restore the household.`
          : verificationSent
            ? `This device is now linked to ${authSession.email ?? normalizeAccountEmail(state.linkAccountDraft.email)}. A verification email has been sent, and you can still sign in on another browser or phone while you finish that step.`
            : `This device is now linked to ${authSession.email ?? normalizeAccountEmail(state.linkAccountDraft.email)}. You can resend the verification email from Account security when you are ready.`,
      });
    } catch (error) {
      set({
        isSaving: false,
        error:
          error instanceof Error
            ? error.message
            : 'Unable to link this Home Basket account right now.',
        notice: null,
      });
    }
  },
  async sendPasswordReset(email) {
    const state = get();
    const targetEmail = email ?? state.signInDraft.email;
    const validation = validatePasswordResetEmailInput(targetEmail);

    if (validation) {
      set({ error: validation, notice: null });
      return;
    }

    try {
      set({ isSaving: true, error: null, notice: null });
      await authRepository.sendPasswordResetEmail(targetEmail);
      set({
        isSaving: false,
        error: null,
        notice: `Password reset email sent to ${normalizeAccountEmail(targetEmail)}. Open that inbox, reset the password, then sign in again here.`,
      });
    } catch (error) {
      set({
        isSaving: false,
        error:
          error instanceof Error
            ? error.message
            : 'Unable to send the password reset email right now.',
        notice: null,
      });
    }
  },
  async sendVerificationEmail() {
    const state = get();

    if (!state.authSession || state.authSession.provider !== 'firebase-email-password') {
      set({
        error: 'Link an email and password to this device before sending verification.',
        notice: null,
      });
      return;
    }

    if (state.authSession.emailVerified) {
      set({
        error: null,
        notice: `${state.authSession.email ?? 'This account'} is already verified.`,
      });
      return;
    }

    try {
      set({ isSaving: true, error: null, notice: null });
      await authRepository.sendEmailVerification();
      set({
        isSaving: false,
        error: null,
        notice: `Verification email sent to ${state.authSession.email ?? 'your inbox'}. Open that link, then tap refresh account status here.`,
      });
    } catch (error) {
      set({
        isSaving: false,
        error:
          error instanceof Error
            ? error.message
            : 'Unable to send the verification email right now.',
        notice: null,
      });
    }
  },
  async refreshAccountStatus() {
    try {
      set({ isSaving: true, error: null, notice: null });
      const authSession = await authRepository.refreshSession();

      set({
        authSession,
        isSaving: false,
        error: null,
        notice:
          authSession.provider === 'firebase-email-password' && authSession.emailVerified
            ? `${authSession.email ?? 'Your account'} is now verified.`
            : null,
      });
    } catch (error) {
      set({
        isSaving: false,
        error:
          error instanceof Error
            ? error.message
            : 'Unable to refresh the Home Basket account status right now.',
        notice: null,
      });
    }
  },
  async pickTripReceipt() {
    try {
      set({ isSaving: true, error: null, notice: null });
      const receipt = await pickTripReceiptImage();

      if (!receipt) {
        set({ isSaving: false, notice: null });
        return;
      }

      set((state) => ({
        isSaving: false,
        tripDraft: {
          ...state.tripDraft,
          receiptPreviewUri: receipt.previewUri,
          receiptBase64: receipt.base64,
          receiptMimeType: receipt.mimeType,
          receiptFileName: receipt.fileName,
          receiptAnalysis: null,
        },
        notice: canAnalyzeReceipts
          ? `Receipt photo ready: ${receipt.fileName}. Home Basket is reading the slip now.`
          : `Receipt photo ready: ${receipt.fileName}. It will upload when you record the trip.`,
      }));

      if (canAnalyzeReceipts) {
        await get().analyzeTripReceipt();
      }
    } catch (error) {
      set({
        isSaving: false,
        error:
          error instanceof Error
            ? error.message
            : 'Unable to attach that receipt image right now.',
        notice: null,
      });
    }
  },
  clearTripReceipt() {
    set((state) => ({
      tripDraft: {
        ...state.tripDraft,
        receiptPreviewUri: '',
        receiptBase64: null,
        receiptMimeType: null,
        receiptFileName: null,
        receiptAnalysis: null,
      },
      isAnalyzingReceipt: false,
      error: null,
      notice: null,
    }));
  },
  async analyzeTripReceipt() {
    const state = get();
    const snapshot = state.snapshot;

    if (
      !state.tripDraft.receiptBase64 ||
      !state.tripDraft.receiptMimeType ||
      !state.tripDraft.receiptPreviewUri
    ) {
      set({
        error: 'Attach a receipt image first before trying to read it.',
        notice: null,
      });
      return null;
    }

    try {
      set({ isAnalyzingReceipt: true, error: null, notice: null });
      const analysis = await analyzeReceiptImage({
        base64: state.tripDraft.receiptBase64,
        mimeType: state.tripDraft.receiptMimeType,
      });

      set((currentState) => {
        const detectedItems = normalizeTripPurchasedItems(analysis.items);
        const hasReviewedItems =
          normalizeTripPurchasedItems(currentState.tripDraft.purchasedItemsDraft).length > 0;
        const shouldAutofillStore =
          !!analysis.merchantName &&
          snapshot &&
          (!currentState.tripDraft.store.trim() ||
            currentState.tripDraft.store === snapshot.household.primaryStore);
        const shouldAutofillTotal =
          !currentState.tripDraft.totalSpend.trim() && analysis.detectedTotalSpendCents;

        return {
          isAnalyzingReceipt: false,
          tripDraft: {
            ...currentState.tripDraft,
            store: shouldAutofillStore
              ? (analysis.merchantName ?? currentState.tripDraft.store)
              : currentState.tripDraft.store,
            totalSpend: shouldAutofillTotal
              ? formatCurrencyInputValue(analysis.detectedTotalSpendCents!)
              : currentState.tripDraft.totalSpend,
            receiptAnalysis: analysis,
            purchasedItemsDraft: hasReviewedItems
              ? currentState.tripDraft.purchasedItemsDraft
              : detectedItems,
          },
          notice:
            analysis.items.length > 0 || analysis.detectedTotalSpendCents
              ? `Receipt read: found ${analysis.items.length} item${analysis.items.length === 1 ? '' : 's'}${analysis.detectedTotalSpendCents ? ` and total ${formatCurrencyInputValue(analysis.detectedTotalSpendCents)}` : ''}${!hasReviewedItems && detectedItems.length ? '. The trip review list was filled for you.' : ''}`
              : 'Receipt uploaded, but no confident line items were extracted from this image.',
        };
      });

      return analysis;
    } catch (error) {
      set({
        isAnalyzingReceipt: false,
        error:
          error instanceof Error
            ? error.message
            : 'Home Basket could not read that receipt image right now.',
        notice: null,
      });

      return null;
    }
  },
  async createReminder() {
    const state = get();
    const snapshot = state.snapshot;
    const selectedMemberId = state.selectedMemberId;

    if (!snapshot || !selectedMemberId) {
      return;
    }

    if (!state.reminderDraft.title.trim()) {
      set({ error: 'Enter a reminder title.', notice: null });
      return;
    }

    if (!parseDateInputValue(state.reminderDraft.nextDueAt)) {
      set({ error: 'Enter the next due date as YYYY-MM-DD.', notice: null });
      return;
    }

    try {
      set({ isSaving: true, error: null, notice: null });
      await homeBasketRepository.createReminder(snapshot.household.id, {
        title: state.reminderDraft.title,
        quantity: state.reminderDraft.quantity,
        category: resolveShoppingCategory(
          state.reminderDraft.category,
          state.reminderDraft.customCategory
        ),
        cadence: state.reminderDraft.cadence,
        nextDueAt: state.reminderDraft.nextDueAt,
        createdByMemberId: selectedMemberId,
        note: state.reminderDraft.note.trim() || undefined,
      });
      set({
        isSaving: false,
        reminderDraft: createDefaultReminderDraft(),
        notice: `Reminder saved for ${state.reminderDraft.title.trim()}.`,
      });
    } catch (error) {
      set({
        isSaving: false,
        error:
          error instanceof Error
            ? error.message
            : 'Unable to save that reminder right now.',
        notice: null,
      });
    }
  },
  async addReminderToBasket(reminderId) {
    const state = get();
    const snapshot = state.snapshot;
    const selectedMemberId = state.selectedMemberId;

    if (!snapshot || !selectedMemberId) {
      return;
    }

    const reminder = snapshot.reminders.find((candidate) => candidate.id === reminderId);

    if (!reminder) {
      set({ error: 'That reminder no longer exists.', notice: null });
      return;
    }

    try {
      set({ isSaving: true, error: null, notice: null });
      await homeBasketRepository.addReminderToBasket(
        snapshot.household.id,
        reminderId,
        selectedMemberId
      );
      set({
        isSaving: false,
        notice: `${reminder.title} was added back to the basket.`,
      });
    } catch (error) {
      set({
        isSaving: false,
        error:
          error instanceof Error
            ? error.message
            : 'Unable to add that reminder to the basket right now.',
        notice: null,
      });
    }
  },
  async deleteReminder(reminderId) {
    const snapshot = get().snapshot;

    if (!snapshot) {
      return;
    }

    const reminder = snapshot.reminders.find((candidate) => candidate.id === reminderId);

    try {
      set({ isSaving: true, error: null, notice: null });
      await homeBasketRepository.deleteReminder(snapshot.household.id, reminderId);
      set({
        isSaving: false,
        notice: reminder ? `${reminder.title} was removed.` : 'Reminder removed.',
      });
    } catch (error) {
      set({
        isSaving: false,
        error:
          error instanceof Error
            ? error.message
            : 'Unable to remove that reminder right now.',
        notice: null,
      });
    }
  },
  async createInvite() {
    const state = get();

    if (!state.session) {
      return;
    }

    try {
      set({ isSaving: true, error: null, notice: null });
      const invite = await accessRepository.createInvite(
        state.session.householdId,
        state.selectedMemberId ?? state.session.memberId
      );
      set({
        invite,
        notice: null,
        isSaving: false,
      });
    } catch (error) {
      set({
        isSaving: false,
        error:
          error instanceof Error ? error.message : 'Unable to create a new invite code right now.',
        notice: null,
      });
    }
  },
  async signOut() {
    stopSubscription();
    await clearStoredHouseholdSession();
    const authSession = await authRepository.signOut();

    set({
      ...resetHouseholdRuntimeState(),
      authSession,
      isReady: true,
      isBootstrapping: false,
      isSaving: false,
      error: null,
      notice: null,
      onboardingMode: get().demoInviteCode ? 'join' : 'create',
      joinHouseholdDraft: defaultJoinHouseholdDraft,
      createHouseholdDraft: createDefaultCreateHouseholdDraft(),
      signInDraft: defaultSignInDraft,
      linkAccountDraft: defaultLinkAccountDraft,
    });
  },
  async addSuggestedItem(input) {
    const state = get();
    const snapshot = state.snapshot;
    const selectedMemberId = state.selectedMemberId;

    if (!snapshot || !selectedMemberId) {
      return;
    }

    try {
      set({ isSaving: true, error: null, notice: null });
      await homeBasketRepository.addItem(snapshot.household.id, {
        name: input.name,
        quantity: input.quantity,
        category: input.category,
        addedByMemberId: selectedMemberId,
      });
      set({ isSaving: false, notice: null });
    } catch (error) {
      set({
        isSaving: false,
        error: error instanceof Error ? error.message : 'Unable to add that staple right now.',
        notice: null,
      });
    }
  },
  async addTripItemsBackToBasket(tripId) {
    const state = get();
    const snapshot = state.snapshot;
    const selectedMemberId = state.selectedMemberId;

    if (!snapshot || !selectedMemberId) {
      return;
    }

    const trip = snapshot.trips.find((candidate) => candidate.id === tripId);

    if (!trip) {
      set({ error: 'That purchase no longer exists.', notice: null });
      return;
    }

    try {
      const itemsToAdd = buildTripItemsBackToBasketInput({
        snapshot,
        tripId,
        addedByMemberId: selectedMemberId,
      });

      if (itemsToAdd.length === 0) {
        set({
          error: null,
          notice: `${trip.store} is already reflected on the active basket.`,
        });
        return;
      }

      set({ isSaving: true, error: null, notice: null });
      await homeBasketRepository.addItemsBatch(snapshot.household.id, itemsToAdd);
      set({
        isSaving: false,
        error: null,
        notice: `${itemsToAdd.length} item${itemsToAdd.length === 1 ? '' : 's'} from ${trip.store} were added back to the basket.`,
      });
    } catch (error) {
      set({
        isSaving: false,
        error:
          error instanceof Error
            ? error.message
            : 'Unable to add that purchase back to the basket right now.',
        notice: null,
      });
    }
  },
  async addItem() {
    const state = get();
    const snapshot = state.snapshot;
    const selectedMemberId = state.selectedMemberId;

    if (!snapshot || !selectedMemberId) {
      return;
    }

    if (!state.addItemDraft.name.trim()) {
      set({ error: 'Please enter an item name.', notice: null });
      return;
    }

    try {
      set({ isSaving: true, error: null, notice: null });
      await homeBasketRepository.addItem(snapshot.household.id, {
        name: state.addItemDraft.name,
        quantity: state.addItemDraft.quantity,
        category: resolveShoppingCategory(
          state.addItemDraft.category,
          state.addItemDraft.customCategory
        ),
        addedByMemberId: selectedMemberId,
      });
      set({
        addItemDraft: defaultAddItemDraft,
        isSaving: false,
        notice: null,
      });
    } catch (error) {
      set({
        isSaving: false,
        error: error instanceof Error ? error.message : 'Unable to add that item right now.',
        notice: null,
      });
    }
  },
  async saveItemEdits() {
    const state = get();
    const snapshot = state.snapshot;

    if (!snapshot || !state.editingItemId) {
      return;
    }

    if (!state.itemEditDraft.name.trim()) {
      set({ error: 'Please enter an item name.', notice: null });
      return;
    }

    try {
      set({ isSaving: true, error: null, notice: null });
      await homeBasketRepository.updateItem(snapshot.household.id, state.editingItemId, {
        name: state.itemEditDraft.name,
        quantity: state.itemEditDraft.quantity,
        category: resolveShoppingCategory(state.itemEditDraft.category),
      });
      set({
        isSaving: false,
        editingItemId: null,
        itemEditDraft: defaultItemEditDraft,
        notice: 'Shopping item updated.',
      });
    } catch (error) {
      set({
        isSaving: false,
        error: error instanceof Error ? error.message : 'Unable to update that item right now.',
        notice: null,
      });
    }
  },
  async deleteItem(itemId) {
    const snapshot = get().snapshot;

    if (!snapshot) {
      return;
    }

    const item = snapshot.items.find((candidate) => candidate.id === itemId);

    try {
      set({ isSaving: true, error: null, notice: null });
      await homeBasketRepository.deleteItem(snapshot.household.id, itemId);
      set((state) => ({
        isSaving: false,
        editingItemId: state.editingItemId === itemId ? null : state.editingItemId,
        itemEditDraft: state.editingItemId === itemId ? defaultItemEditDraft : state.itemEditDraft,
        notice: item ? `${item.name} was removed from the basket.` : 'Shopping item removed.',
      }));
    } catch (error) {
      set({
        isSaving: false,
        error: error instanceof Error ? error.message : 'Unable to remove that item right now.',
        notice: null,
      });
    }
  },
  async toggleItemStatus(itemId) {
    const snapshot = get().snapshot;

    if (!snapshot) {
      return;
    }

    try {
      set({ error: null, notice: null });
      await homeBasketRepository.toggleItemStatus(snapshot.household.id, itemId);
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Unable to update that item right now.',
        notice: null,
      });
    }
  },
  async completeTrip() {
    const state = get();
    const snapshot = state.snapshot;
    const selectedMemberId = state.selectedMemberId;

    if (!snapshot || !selectedMemberId) {
      return;
    }

    let receiptAnalysis = state.tripDraft.receiptAnalysis;

    if (
      !state.tripDraft.totalSpend.trim() &&
      state.tripDraft.receiptBase64 &&
      state.tripDraft.receiptMimeType &&
      canAnalyzeReceipts &&
      !receiptAnalysis?.detectedTotalSpendCents
    ) {
      receiptAnalysis = await get().analyzeTripReceipt();
    }
    const latestTripDraft = get().tripDraft;

    const totalSpendCents =
      parseCurrencyInput(latestTripDraft.totalSpend) ??
      receiptAnalysis?.detectedTotalSpendCents ??
      null;
    const reviewedPurchasedItems = normalizeTripPurchasedItems(
      latestTripDraft.purchasedItemsDraft
    );

    if (totalSpendCents === null) {
      set({
        error: latestTripDraft.receiptBase64
          ? `Home Basket could not detect the total from this receipt yet. Enter it manually for now. ${getAdvancedReceiptTranscriptionMessage()}`
          : 'Enter the total spend for this purchase, for example 842.50.',
        notice: null,
      });
      return;
    }

    try {
      set({ isSaving: true, error: null, notice: null });
      await homeBasketRepository.completeTrip(snapshot.household.id, {
        store: latestTripDraft.store.trim() || snapshot.household.primaryStore,
        shopperMemberId: selectedMemberId,
        totalSpendCents,
        note: latestTripDraft.note.trim() || undefined,
        purchasedItems: reviewedPurchasedItems,
        receipt:
          latestTripDraft.receiptBase64 &&
          latestTripDraft.receiptMimeType &&
          latestTripDraft.receiptFileName &&
          latestTripDraft.receiptPreviewUri
            ? {
                base64: latestTripDraft.receiptBase64,
                mimeType: latestTripDraft.receiptMimeType,
                fileName: latestTripDraft.receiptFileName,
                previewUri: latestTripDraft.receiptPreviewUri,
              }
            : undefined,
      });
      set({
        isSaving: false,
        tripDraft: {
          ...defaultTripDraft,
          store: snapshot.household.primaryStore,
        },
        notice: 'Purchase recorded and the bought items moved into history.',
      });
    } catch (error) {
      set({
        isSaving: false,
        error: error instanceof Error ? error.message : 'Unable to record that purchase right now.',
        notice: null,
      });
    }
  },
}));
