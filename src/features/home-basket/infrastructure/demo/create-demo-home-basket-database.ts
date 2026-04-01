import { HouseholdInvite, HouseholdSession } from '@/features/home-basket/domain/access-models';
import { HomeBasketSnapshot } from '@/features/home-basket/domain/models';
import {
  createDemoHomeBasketSnapshot,
  HOME_BASKET_DEMO_INVITE_CODE,
} from '@/features/home-basket/infrastructure/demo/create-demo-home-basket-snapshot';

export type HouseholdSnapshotListener = (snapshot: HomeBasketSnapshot) => void;

export interface InMemoryHomeBasketDatabase {
  households: Map<string, HomeBasketSnapshot>;
  invites: Map<string, HouseholdInvite>;
  userMemberships: Map<string, HouseholdSession>;
  listeners: Map<string, Set<HouseholdSnapshotListener>>;
}

export function createDemoHomeBasketDatabase(
  referenceDate: Date = new Date()
): InMemoryHomeBasketDatabase {
  const snapshot = createDemoHomeBasketSnapshot(referenceDate);

  return {
    households: new Map([[snapshot.household.id, snapshot]]),
    invites: new Map([
      [
        HOME_BASKET_DEMO_INVITE_CODE,
        {
          code: HOME_BASKET_DEMO_INVITE_CODE,
          householdId: snapshot.household.id,
          householdName: snapshot.household.name,
          createdByMemberId: snapshot.household.shopperOfWeekMemberId,
          createdAt: referenceDate.toISOString(),
        },
      ],
    ]),
    userMemberships: new Map(),
    listeners: new Map(),
  };
}
