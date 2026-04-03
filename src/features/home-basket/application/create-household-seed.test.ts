import { describe, expect, it } from 'vitest';

import {
  addMemberToHouseholdSnapshot,
  createHouseholdSeed,
} from '@/features/home-basket/application/create-household-seed';
import { normalizeInviteCode } from '@/features/home-basket/application/invite-code';

describe('createHouseholdSeed', () => {
  it('creates a new empty household, owner session, and invite code', () => {
    const result = createHouseholdSeed(
      {
        householdName: 'Family Nest',
        memberName: 'Naledi Mokoena',
        currencyCode: 'ZAR',
        primaryStore: 'Checkers Hyper',
        monthlyBudgetCents: 480000,
        budgetCycleAnchorDay: 25,
      },
      {
        now: '2026-03-29T08:00:00.000Z',
        authUserId: 'auth-owner',
        createHouseholdId: () => 'household-1',
        createMemberId: () => 'member-1',
        createInviteToken: () => '9xy42',
      }
    );

    expect(result.snapshot.household).toMatchObject({
      id: 'household-1',
      name: 'Family Nest',
      currencyCode: 'ZAR',
      shopperOfWeekMemberId: 'member-1',
      monthlyBudgetCents: 480000,
      budgetCycleAnchorDay: 25,
    });
    expect(result.session).toMatchObject({
      authUserId: 'auth-owner',
      householdId: 'household-1',
      memberId: 'member-1',
      memberRole: 'Owner',
    });
    expect(result.invite.code).toBe('FN-9XY42');
  });

  it('keeps budget and primary store optional for a lighter first setup', () => {
    const result = createHouseholdSeed(
      {
        householdName: 'Family Nest',
        memberName: 'Naledi Mokoena',
        currencyCode: 'USD',
        primaryStore: '',
        monthlyBudgetCents: 0,
        budgetCycleAnchorDay: 25,
      },
      {
        now: '2026-03-29T08:00:00.000Z',
        authUserId: 'auth-owner',
        createHouseholdId: () => 'household-1',
        createMemberId: () => 'member-1',
        createInviteToken: () => '9xy42',
      }
    );

    expect(result.snapshot.household.primaryStore).toBe('');
    expect(result.snapshot.household.currencyCode).toBe('USD');
    expect(result.snapshot.household.monthlyBudgetCents).toBe(0);
  });
});

describe('addMemberToHouseholdSnapshot', () => {
  it('adds a new household member and returns a session for that device user', () => {
    const seed = createHouseholdSeed(
      {
        householdName: 'Home Basket',
        memberName: 'Themba',
        currencyCode: 'GBP',
        primaryStore: 'Checkers Hyper',
        monthlyBudgetCents: 520000,
        budgetCycleAnchorDay: 25,
      },
      {
        authUserId: 'auth-owner',
        createHouseholdId: () => 'household-1',
        createMemberId: () => 'member-owner',
        createInviteToken: () => 'abc12',
      }
    );

    const result = addMemberToHouseholdSnapshot(seed.snapshot, 'Lindiwe', {
      authUserId: 'auth-join',
      createMemberId: () => 'member-join',
    });

    expect(result.snapshot.members.at(-1)).toMatchObject({
      authUserId: 'auth-join',
      id: 'member-join',
      name: 'Lindiwe',
      role: 'Household member',
    });
    expect(result.session).toMatchObject({
      authUserId: 'auth-join',
      householdId: 'household-1',
      memberId: 'member-join',
      memberName: 'Lindiwe',
    });
  });
});

describe('normalizeInviteCode', () => {
  it('normalizes invite code entry for joining households', () => {
    expect(normalizeInviteCode(' hb  - 9x y42 ')).toBe('HB-9X-Y42');
  });
});
