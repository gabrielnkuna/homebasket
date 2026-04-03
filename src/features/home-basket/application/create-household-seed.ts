import {
  CreateHouseholdInput,
  CreateHouseholdSeedResult,
  HouseholdSession,
} from '@/features/home-basket/domain/access-models';
import { HomeBasketSnapshot } from '@/features/home-basket/domain/models';
import { normalizeBudgetCycleAnchorDay } from '@/features/home-basket/application/budget-cycle';
import { buildInviteCode } from '@/features/home-basket/application/invite-code';
import { normalizeCurrencyCode } from '@/shared/locale/currency-preferences';

type HouseholdSeedOptions = {
  now?: string;
  authUserId?: string;
  createHouseholdId?: () => string;
  createMemberId?: () => string;
  createInviteToken?: () => string;
};

function toInitials(name: string) {
  const initials = name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');

  return initials || 'HB';
}

export function createHouseholdSeed(
  input: CreateHouseholdInput,
  options: HouseholdSeedOptions = {}
): CreateHouseholdSeedResult {
  const householdName = input.householdName.trim();
  const memberName = input.memberName.trim();

  if (!householdName) {
    throw new Error('Please enter a household name.');
  }

  if (!memberName) {
    throw new Error('Please enter your name.');
  }

  const now = options.now ?? new Date().toISOString();
  const householdId = options.createHouseholdId?.() ?? `household-${now}`;
  const memberId = options.createMemberId?.() ?? `member-${now}`;
  const inviteToken = options.createInviteToken?.() ?? householdId.slice(-5);
  const inviteCode = buildInviteCode(householdName, inviteToken);
  const budgetCycleAnchorDay = normalizeBudgetCycleAnchorDay(input.budgetCycleAnchorDay);
  const currencyCode = normalizeCurrencyCode(input.currencyCode);

  const snapshot: HomeBasketSnapshot = {
    household: {
      id: householdId,
      name: householdName,
      currencyCode,
      primaryStore: input.primaryStore.trim(),
      shopperOfWeekMemberId: memberId,
      monthlyBudgetCents: Math.max(input.monthlyBudgetCents, 0),
      budgetCycleAnchorDay,
    },
    members: [
      {
        id: memberId,
        name: memberName,
        initials: toInitials(memberName),
        role: 'Owner',
        authUserId: options.authUserId,
      },
    ],
    items: [],
    trips: [],
    reminders: [],
  };

  const session: HouseholdSession = {
    authUserId: options.authUserId ?? `auth-${memberId}`,
    householdId,
    householdName,
    memberId,
    memberName,
    memberRole: 'Owner',
  };

  return {
    snapshot,
    session,
    invite: {
      code: inviteCode,
      householdId,
      householdName,
      createdByMemberId: memberId,
      createdAt: now,
    },
  };
}

type JoinHouseholdOptions = {
  authUserId?: string;
  createMemberId?: () => string;
};

export function addMemberToHouseholdSnapshot(
  snapshot: HomeBasketSnapshot,
  memberName: string,
  options: JoinHouseholdOptions = {}
): {
  snapshot: HomeBasketSnapshot;
  session: HouseholdSession;
} {
  const cleanedName = memberName.trim();

  if (!cleanedName) {
    throw new Error('Please enter your name.');
  }

  const memberId = options.createMemberId?.() ?? `member-${cleanedName.toLowerCase().replace(/\s+/g, '-')}`;
  const role = 'Household member';

  return {
    snapshot: {
      ...snapshot,
      members: [
        ...snapshot.members,
        {
          id: memberId,
          name: cleanedName,
          initials: toInitials(cleanedName),
          role,
          authUserId: options.authUserId,
        },
      ],
    },
    session: {
      authUserId: options.authUserId ?? `auth-${memberId}`,
      householdId: snapshot.household.id,
      householdName: snapshot.household.name,
      memberId,
      memberName: cleanedName,
      memberRole: role,
    },
  };
}
