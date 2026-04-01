import { describe, expect, it } from 'vitest';

import { HomeBasketAuthSession } from '@/features/home-basket/domain/auth-models';
import { createDemoHomeBasketDatabase } from '@/features/home-basket/infrastructure/demo/create-demo-home-basket-database';
import { createInMemoryHomeBasketAccessRepository } from '@/features/home-basket/infrastructure/in-memory-home-basket-access-repository';

function createAuthSession(userId: string): HomeBasketAuthSession {
  return {
    userId,
    provider: 'demo-device',
    email: null,
    emailVerified: false,
  };
}

describe('createInMemoryHomeBasketAccessRepository', () => {
  it('binds the created household owner to the authenticated device user', async () => {
    const database = createDemoHomeBasketDatabase(new Date('2026-03-29T08:00:00.000Z'));
    const repository = createInMemoryHomeBasketAccessRepository(database);

    const result = await repository.createHousehold(
      {
        householdName: 'Home Basket',
        memberName: 'Naledi',
        primaryStore: 'Checkers Hyper',
        monthlyBudgetCents: 520000,
        budgetCycleAnchorDay: 25,
      },
      createAuthSession('auth-owner')
    );

    expect(result.session.authUserId).toBe('auth-owner');
    expect(result.session.memberId).toBe('auth-owner');

    const restoredSession = await repository.restoreSession('auth-owner');

    expect(restoredSession).toMatchObject({
      authUserId: 'auth-owner',
      householdId: result.session.householdId,
      memberId: result.session.memberId,
      memberName: 'Naledi',
    });
  });

  it('reuses the same household member when the same authenticated device joins twice', async () => {
    const database = createDemoHomeBasketDatabase(new Date('2026-03-29T08:00:00.000Z'));
    const repository = createInMemoryHomeBasketAccessRepository(database);
    const owner = await repository.createHousehold(
      {
        householdName: 'Home Basket',
        memberName: 'Themba',
        primaryStore: 'Checkers Hyper',
        monthlyBudgetCents: 520000,
        budgetCycleAnchorDay: 25,
      },
      createAuthSession('auth-owner')
    );

    const firstJoin = await repository.joinHousehold(
      {
        inviteCode: owner.invite.code,
        memberName: 'Lindiwe',
      },
      createAuthSession('auth-helper')
    );

    const secondJoin = await repository.joinHousehold(
      {
        inviteCode: owner.invite.code,
        memberName: 'Another Name',
      },
      createAuthSession('auth-helper')
    );

    expect(secondJoin).toMatchObject({
      authUserId: 'auth-helper',
      householdId: firstJoin.householdId,
      memberId: 'auth-helper',
      memberName: 'Lindiwe',
    });
  });
});
