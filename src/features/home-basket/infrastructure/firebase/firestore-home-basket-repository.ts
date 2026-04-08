import {
  collection,
  deleteDoc,
  doc,
  Firestore,
  getDoc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  setDoc,
  updateDoc,
  writeBatch,
  QueryDocumentSnapshot,
  DocumentData,
  where,
} from 'firebase/firestore';
import {
  FirebaseStorage,
  getDownloadURL,
  ref as storageRef,
  uploadString,
} from 'firebase/storage';

import { normalizeBudgetCycleAnchorDay } from '@/features/home-basket/application/budget-cycle';
import { buildTripPurchasedItems } from '@/features/home-basket/application/trip-purchased-items';
import {
  HomeBasketSnapshot,
  Household,
  HouseholdMember,
  ShoppingReminder,
  ShoppingItem,
  ShoppingTrip,
} from '@/features/home-basket/domain/models';
import {
  AddItemInput,
  CompleteTripInput,
  CreateReminderInput,
  HomeBasketRepository,
  UpdateItemInput,
} from '@/features/home-basket/domain/repository';
import {
  coerceCurrencyCode,
  normalizeCurrencyCode,
} from '@/shared/locale/currency-preferences';
import { parseDateInputValue } from '@/shared/format/date';

function mapHousehold(snapshot: QueryDocumentSnapshot<DocumentData>): Household {
  const data = snapshot.data();

  return {
    id: snapshot.id,
    name: data.name,
    currencyCode: coerceCurrencyCode(data.currencyCode),
    primaryStore: data.primaryStore,
    shopperOfWeekMemberId: data.shopperOfWeekMemberId,
    monthlyBudgetCents: data.monthlyBudgetCents,
    budgetCycleAnchorDay: Number(data.budgetCycleAnchorDay ?? 1),
  };
}

function mapMember(snapshot: QueryDocumentSnapshot<DocumentData>): HouseholdMember {
  const data = snapshot.data();

  return {
    id: snapshot.id,
    name: data.name,
    initials: data.initials,
    role: data.role,
    authUserId: data.authUserId,
  };
}

function mapItem(snapshot: QueryDocumentSnapshot<DocumentData>): ShoppingItem {
  const data = snapshot.data();

  return {
    id: snapshot.id,
    name: data.name,
    category: data.category,
    quantity: data.quantity,
    status: data.status,
    addedByMemberId: data.addedByMemberId,
    addedAt: data.addedAt,
    note: data.note,
  };
}

function mapTrip(snapshot: QueryDocumentSnapshot<DocumentData>): ShoppingTrip {
  const data = snapshot.data();

  return {
    id: snapshot.id,
    store: data.store,
    shopperMemberId: data.shopperMemberId,
    totalSpendCents: data.totalSpendCents,
    completedAt: data.completedAt,
    note: data.note,
    purchasedItems: data.purchasedItems ?? [],
    receipt: data.receipt
      ? {
          downloadUrl: data.receipt.downloadUrl,
          storagePath: data.receipt.storagePath,
          fileName: data.receipt.fileName,
          contentType: data.receipt.contentType,
          uploadedAt: data.receipt.uploadedAt,
        }
      : undefined,
  };
}

function mapReminder(snapshot: QueryDocumentSnapshot<DocumentData>): ShoppingReminder {
  const data = snapshot.data();

  return {
    id: snapshot.id,
    title: data.title,
    quantity: data.quantity,
    category: data.category,
    cadence: data.cadence,
    nextDueAt: data.nextDueAt,
    createdByMemberId: data.createdByMemberId,
    createdAt: data.createdAt,
    note: data.note,
    lastAddedAt: data.lastAddedAt,
  };
}

function buildOptionalNote(note?: string) {
  const cleanedNote = note?.trim();

  if (!cleanedNote) {
    return {};
  }

  return {
    note: cleanedNote,
  };
}

function buildItemDocument(input: AddItemInput) {
  return {
    name: input.name.trim(),
    category: input.category,
    quantity: input.quantity.trim() || '1',
    status: 'pending',
    addedByMemberId: input.addedByMemberId,
    addedAt: new Date().toISOString(),
    ...buildOptionalNote(input.note),
  };
}

function parseReminderDueDate(nextDueAt: string) {
  const parsedDate = parseDateInputValue(nextDueAt);

  if (!parsedDate) {
    throw new Error('Enter the next due date as YYYY-MM-DD.');
  }

  return parsedDate;
}

function advanceReminderDueDate(referenceDateIso: string, cadence: string) {
  const nextDate = new Date(referenceDateIso);

  switch (cadence) {
    case 'weekly':
      nextDate.setUTCDate(nextDate.getUTCDate() + 7);
      break;
    case 'fortnightly':
      nextDate.setUTCDate(nextDate.getUTCDate() + 14);
      break;
    default:
      nextDate.setUTCMonth(nextDate.getUTCMonth() + 1);
      break;
  }

  return nextDate.toISOString();
}

function inferReceiptExtension(fileName: string, mimeType: string) {
  const fileExtension = fileName.split('.').pop()?.toLowerCase();

  if (fileExtension && /^[a-z0-9]+$/.test(fileExtension)) {
    return fileExtension;
  }

  switch (mimeType) {
    case 'image/png':
      return 'png';
    case 'image/webp':
      return 'webp';
    default:
      return 'jpg';
  }
}

async function uploadTripReceipt(
  storage: FirebaseStorage | null,
  householdId: string,
  tripId: string,
  receipt: NonNullable<CompleteTripInput['receipt']>
) {
  if (!storage) {
    return {
      downloadUrl: receipt.previewUri,
      storagePath: `local-preview://${householdId}/${tripId}`,
      fileName: receipt.fileName,
      contentType: receipt.mimeType,
      uploadedAt: new Date().toISOString(),
    };
  }

  const extension = inferReceiptExtension(receipt.fileName, receipt.mimeType);
  const path = `households/${householdId}/trips/${tripId}/receipt.${extension}`;
  const snapshot = await uploadString(storageRef(storage, path), receipt.base64, 'base64', {
    contentType: receipt.mimeType,
  });
  const downloadUrl = await getDownloadURL(snapshot.ref);

  return {
    downloadUrl,
    storagePath: path,
    fileName: receipt.fileName,
    contentType: receipt.mimeType,
    uploadedAt: new Date().toISOString(),
  };
}

export function createFirestoreHomeBasketRepository(
  db: Firestore,
  storage: FirebaseStorage | null
): HomeBasketRepository {
  return {
    subscribe(householdId, listener) {
      const latest: Partial<HomeBasketSnapshot> = {};
      const hasLoaded = {
        household: false,
        members: false,
        items: false,
        trips: false,
        reminders: false,
      };

      const emit = () => {
        if (
          !hasLoaded.household ||
          !hasLoaded.members ||
          !hasLoaded.items ||
          !hasLoaded.trips ||
          !hasLoaded.reminders ||
          !latest.household ||
          !latest.members ||
          !latest.items ||
          !latest.trips ||
          !latest.reminders
        ) {
          return;
        }

        listener({
          household: latest.household,
          members: latest.members,
          items: latest.items,
          trips: latest.trips,
          reminders: latest.reminders,
        });
      };

      const householdUnsubscribe = onSnapshot(doc(db, 'households', householdId), (snapshot) => {
        if (!snapshot.exists()) {
          return;
        }

        hasLoaded.household = true;
        latest.household = mapHousehold(snapshot as QueryDocumentSnapshot<DocumentData>);
        emit();
      });

      const membersUnsubscribe = onSnapshot(
        query(collection(db, 'households', householdId, 'members'), orderBy('name', 'asc')),
        (snapshot) => {
          hasLoaded.members = true;
          latest.members = snapshot.docs.map(mapMember);
          emit();
        }
      );

      const itemsUnsubscribe = onSnapshot(
        query(collection(db, 'households', householdId, 'items'), orderBy('addedAt', 'desc')),
        (snapshot) => {
          hasLoaded.items = true;
          latest.items = snapshot.docs.map(mapItem);
          emit();
        }
      );

      const tripsUnsubscribe = onSnapshot(
        query(collection(db, 'households', householdId, 'trips'), orderBy('completedAt', 'desc')),
        (snapshot) => {
          hasLoaded.trips = true;
          latest.trips = snapshot.docs.map(mapTrip);
          emit();
        }
      );

      const remindersUnsubscribe = onSnapshot(
        query(collection(db, 'households', householdId, 'reminders'), orderBy('nextDueAt', 'asc')),
        (snapshot) => {
          hasLoaded.reminders = true;
          latest.reminders = snapshot.docs.map(mapReminder);
          emit();
        }
      );

      return () => {
        householdUnsubscribe();
        membersUnsubscribe();
        itemsUnsubscribe();
        tripsUnsubscribe();
        remindersUnsubscribe();
      };
    },
    async updateCurrencyCode(householdId, currencyCode: string) {
      await updateDoc(doc(db, 'households', householdId), {
        currencyCode: normalizeCurrencyCode(currencyCode),
      });
    },
    async updateBudgetCycleAnchorDay(householdId, budgetCycleAnchorDay: number) {
      await updateDoc(doc(db, 'households', householdId), {
        budgetCycleAnchorDay: normalizeBudgetCycleAnchorDay(budgetCycleAnchorDay),
      });
    },
    async updateMonthlyBudget(householdId, monthlyBudgetCents: number) {
      await updateDoc(doc(db, 'households', householdId), {
        monthlyBudgetCents: Math.max(monthlyBudgetCents, 0),
      });
    },
    async addItem(householdId, input: AddItemInput) {
      const itemRef = doc(collection(db, 'households', householdId, 'items'));
      await setDoc(itemRef, buildItemDocument(input));
    },
    async addItemsBatch(householdId, inputs: AddItemInput[]) {
      if (inputs.length === 0) {
        return;
      }

      const batch = writeBatch(db);

      inputs.forEach((input) => {
        const itemRef = doc(collection(db, 'households', householdId, 'items'));
        batch.set(itemRef, buildItemDocument(input));
      });

      await batch.commit();
    },
    async updateItem(householdId, itemId: string, input: UpdateItemInput) {
      const itemRef = doc(db, 'households', householdId, 'items', itemId);
      const itemSnapshot = await getDoc(itemRef);

      if (!itemSnapshot.exists()) {
        throw new Error('That shopping item no longer exists.');
      }

      await updateDoc(itemRef, {
        name: input.name.trim(),
        quantity: input.quantity.trim() || '1',
        category: input.category,
      });
    },
    async deleteItem(householdId, itemId: string) {
      const itemRef = doc(db, 'households', householdId, 'items', itemId);
      const itemSnapshot = await getDoc(itemRef);

      if (!itemSnapshot.exists()) {
        throw new Error('That shopping item no longer exists.');
      }

      await deleteDoc(itemRef);
    },
    async toggleItemStatus(householdId, itemId: string) {
      const itemRef = doc(db, 'households', householdId, 'items', itemId);
      const itemSnapshot = await getDoc(itemRef);

      if (!itemSnapshot.exists()) {
        throw new Error('That shopping item no longer exists.');
      }

      const currentStatus = itemSnapshot.data().status;
      await updateDoc(itemRef, {
        status: currentStatus === 'bought' ? 'pending' : 'bought',
      });
    },
    async completeTrip(householdId, input: CompleteTripInput) {
      const boughtItemsQuery = query(
        collection(db, 'households', householdId, 'items'),
        where('status', '==', 'bought')
      );
      const boughtItemsSnapshot = await getDocs(boughtItemsQuery);

      const boughtItems = boughtItemsSnapshot.docs.map((snapshot) => {
        const data = snapshot.data();

        return {
          id: snapshot.id,
          name: data.name,
          category: data.category,
          quantity: data.quantity,
        };
      });
      const finalPurchasedItems = buildTripPurchasedItems({
        boughtItems,
        reviewedItems: input.purchasedItems,
      });

      const tripRef = doc(collection(db, 'households', householdId, 'trips'));
      const batch = writeBatch(db);
      const receipt = input.receipt
        ? await uploadTripReceipt(storage, householdId, tripRef.id, input.receipt)
        : undefined;

      batch.set(tripRef, {
        store: input.store.trim() || 'Unspecified store',
        shopperMemberId: input.shopperMemberId,
        totalSpendCents: input.totalSpendCents,
        completedAt: new Date().toISOString(),
        purchasedItems: finalPurchasedItems,
        ...(receipt ? { receipt } : {}),
        ...buildOptionalNote(input.note),
      });

      boughtItemsSnapshot.docs.forEach((snapshot) => {
        batch.delete(snapshot.ref);
      });

      await batch.commit();
    },
    async createReminder(householdId, input: CreateReminderInput) {
      const reminderRef = doc(collection(db, 'households', householdId, 'reminders'));
      const title = input.title.trim();

      if (!title) {
        throw new Error('Enter a reminder title.');
      }

      await setDoc(reminderRef, {
        title,
        quantity: input.quantity.trim() || '1',
        category: input.category,
        cadence: input.cadence,
        nextDueAt: parseReminderDueDate(input.nextDueAt),
        createdByMemberId: input.createdByMemberId,
        createdAt: new Date().toISOString(),
        ...buildOptionalNote(input.note),
      });
    },
    async addReminderToBasket(householdId, reminderId, addedByMemberId) {
      const reminderRef = doc(db, 'households', householdId, 'reminders', reminderId);
      const reminderSnapshot = await getDoc(reminderRef);

      if (!reminderSnapshot.exists()) {
        throw new Error('That reminder no longer exists.');
      }

      const reminder = reminderSnapshot.data();
      const now = new Date().toISOString();
      const itemRef = doc(collection(db, 'households', householdId, 'items'));
      const batch = writeBatch(db);

      batch.set(itemRef, {
        name: String(reminder.title).trim(),
        category: reminder.category,
        quantity: String(reminder.quantity).trim() || '1',
        status: 'pending',
        addedByMemberId,
        addedAt: now,
        ...buildOptionalNote(reminder.note),
      });

      batch.update(reminderRef, {
        nextDueAt: advanceReminderDueDate(now, String(reminder.cadence)),
        lastAddedAt: now,
      });

      await batch.commit();
    },
    async deleteReminder(householdId, reminderId) {
      const reminderRef = doc(db, 'households', householdId, 'reminders', reminderId);
      const batch = writeBatch(db);
      batch.delete(reminderRef);
      await batch.commit();
    },
  };
}
