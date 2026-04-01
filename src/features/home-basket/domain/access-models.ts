import { HomeBasketSnapshot } from '@/features/home-basket/domain/models';

export interface HouseholdSession {
  authUserId: string;
  householdId: string;
  householdName: string;
  memberId: string;
  memberName: string;
  memberRole: string;
}

export interface HouseholdInvite {
  code: string;
  householdId: string;
  householdName: string;
  createdByMemberId: string;
  createdAt: string;
}

export interface CreateHouseholdInput {
  householdName: string;
  memberName: string;
  primaryStore: string;
  monthlyBudgetCents: number;
  budgetCycleAnchorDay: number;
}

export interface JoinHouseholdInput {
  inviteCode: string;
  memberName: string;
}

export interface CreateHouseholdSeedResult {
  snapshot: HomeBasketSnapshot;
  session: HouseholdSession;
  invite: HouseholdInvite;
}
