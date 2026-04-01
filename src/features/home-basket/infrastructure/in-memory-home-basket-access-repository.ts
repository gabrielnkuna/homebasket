import {
  addMemberToHouseholdSnapshot,
  createHouseholdSeed,
} from '@/features/home-basket/application/create-household-seed';
import { buildInviteCode, normalizeInviteCode } from '@/features/home-basket/application/invite-code';
import { CreateHouseholdResult, HomeBasketAccessRepository } from '@/features/home-basket/domain/access-repository';
import { HomeBasketAuthSession } from '@/features/home-basket/domain/auth-models';
import { InMemoryHomeBasketDatabase } from '@/features/home-basket/infrastructure/demo/create-demo-home-basket-database';

function cloneInvite(invite: {
  code: string;
  householdId: string;
  householdName: string;
  createdByMemberId: string;
  createdAt: string;
}) {
  return { ...invite };
}

function createId(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}

export function createInMemoryHomeBasketAccessRepository(
  database: InMemoryHomeBasketDatabase
): HomeBasketAccessRepository {
  return {
    async createHousehold(
      input,
      authSession: HomeBasketAuthSession
    ): Promise<CreateHouseholdResult> {
      const result = createHouseholdSeed(input, {
        authUserId: authSession.userId,
        createHouseholdId: () => createId('household'),
        createMemberId: () => authSession.userId,
        createInviteToken: () => createId('invite').slice(-5),
      });

      database.households.set(result.snapshot.household.id, result.snapshot);
      database.invites.set(result.invite.code, result.invite);
      database.userMemberships.set(authSession.userId, { ...result.session });

      return {
        session: { ...result.session },
        invite: cloneInvite(result.invite),
      };
    },
    async joinHousehold(input, authSession: HomeBasketAuthSession) {
      const inviteCode = normalizeInviteCode(input.inviteCode);
      const invite = database.invites.get(inviteCode);

      if (!invite) {
        throw new Error('That invite code was not found. Check the code and try again.');
      }

      const household = database.households.get(invite.householdId);

      if (!household) {
        throw new Error('The invited household is no longer available.');
      }

      const existingMember = household.members.find(
        (member) => member.authUserId === authSession.userId
      );

      if (existingMember) {
        return {
          authUserId: authSession.userId,
          householdId: household.household.id,
          householdName: household.household.name,
          memberId: existingMember.id,
          memberName: existingMember.name,
          memberRole: existingMember.role,
        };
      }

      const result = addMemberToHouseholdSnapshot(household, input.memberName, {
        authUserId: authSession.userId,
        createMemberId: () => authSession.userId,
      });

      database.households.set(invite.householdId, result.snapshot);
      database.userMemberships.set(authSession.userId, { ...result.session });

      const listeners = database.listeners.get(invite.householdId);
      listeners?.forEach((listener) => listener(result.snapshot));

      return result.session;
    },
    async restoreSession(authUserId) {
      const storedSession = database.userMemberships.get(authUserId);

      if (storedSession) {
        return { ...storedSession };
      }

      for (const snapshot of database.households.values()) {
        const member = snapshot.members.find((entry) => entry.authUserId === authUserId);

        if (member) {
          return {
            authUserId,
            householdId: snapshot.household.id,
            householdName: snapshot.household.name,
            memberId: member.id,
            memberName: member.name,
            memberRole: member.role,
          };
        }
      }

      return null;
    },
    async syncSession(session) {
      database.userMemberships.set(session.authUserId, { ...session });
    },
    async createInvite(householdId, createdByMemberId) {
      const household = database.households.get(householdId);

      if (!household) {
        throw new Error('The household was not found.');
      }

      const invite = {
        code: buildInviteCode(household.household.name, createId('invite').slice(-5)),
        householdId,
        householdName: household.household.name,
        createdByMemberId,
        createdAt: new Date().toISOString(),
      };

      database.invites.set(invite.code, invite);

      return cloneInvite(invite);
    },
    async getLatestInvite(householdId) {
      const invites = Array.from(database.invites.values())
        .filter((invite) => invite.householdId === householdId)
        .sort((left, right) => right.createdAt.localeCompare(left.createdAt));

      return invites[0] ? cloneInvite(invites[0]) : null;
    },
  };
}
