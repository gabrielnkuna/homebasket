import {
  collection,
  doc,
  Firestore,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  setDoc,
  writeBatch,
} from 'firebase/firestore';

import { createHouseholdSeed } from '@/features/home-basket/application/create-household-seed';
import { normalizeInviteCode } from '@/features/home-basket/application/invite-code';
import {
  CreateHouseholdResult,
  HomeBasketAccessRepository,
} from '@/features/home-basket/domain/access-repository';
import { HouseholdInvite, HouseholdSession } from '@/features/home-basket/domain/access-models';
import { HomeBasketAuthSession } from '@/features/home-basket/domain/auth-models';

function cloneInvite(invite: HouseholdInvite): HouseholdInvite {
  return { ...invite };
}

function mapInvite(code: string, data: Record<string, unknown>): HouseholdInvite {
  return {
    code,
    householdId: String(data.householdId),
    householdName: String(data.householdName),
    createdByMemberId: String(data.createdByMemberId),
    createdAt: String(data.createdAt),
  };
}

function buildUserMembershipDocument(session: HouseholdSession) {
  return {
    ...session,
    updatedAt: new Date().toISOString(),
  };
}

function buildMemberDocument(member: {
  id: string;
  name: string;
  initials: string;
  role: string;
  authUserId?: string;
}) {
  const { id: _memberId, ...memberDocument } = member;
  return memberDocument;
}

export function createFirestoreHomeBasketAccessRepository(
  db: Firestore
): HomeBasketAccessRepository {
  return {
    async createHousehold(
      input,
      authSession: HomeBasketAuthSession
    ): Promise<CreateHouseholdResult> {
      const householdRef = doc(collection(db, 'households'));
      const ownerRef = doc(db, 'households', householdRef.id, 'members', authSession.userId);

      const result = createHouseholdSeed(input, {
        authUserId: authSession.userId,
        createHouseholdId: () => householdRef.id,
        createMemberId: () => ownerRef.id,
        createInviteToken: () => householdRef.id.slice(-5),
      });

      const batch = writeBatch(db);
      const { id: _householdId, ...householdData } = result.snapshot.household;

      batch.set(householdRef, householdData);
      batch.set(ownerRef, buildMemberDocument(result.snapshot.members[0]));
      batch.set(doc(db, 'households', householdRef.id, 'invites', result.invite.code), result.invite);
      batch.set(doc(db, 'householdInvites', result.invite.code), result.invite);
      batch.set(
        doc(db, 'userMemberships', authSession.userId),
        buildUserMembershipDocument(result.session)
      );

      await batch.commit();

      return {
        session: { ...result.session },
        invite: cloneInvite(result.invite),
      };
    },
    async joinHousehold(input, authSession: HomeBasketAuthSession): Promise<HouseholdSession> {
      const inviteCode = normalizeInviteCode(input.inviteCode);
      const inviteSnapshot = await getDoc(doc(db, 'householdInvites', inviteCode));

      if (!inviteSnapshot.exists()) {
        throw new Error('That invite code was not found. Check the code and try again.');
      }

      const invite = mapInvite(inviteSnapshot.id, inviteSnapshot.data() as Record<string, unknown>);

      const memberName = input.memberName.trim();

      if (!memberName) {
        throw new Error('Please enter your name.');
      }

      const memberRef = doc(db, 'households', invite.householdId, 'members', authSession.userId);
      const existingMemberSnapshot = await getDoc(memberRef);

      if (existingMemberSnapshot.exists()) {
        const data = existingMemberSnapshot.data();
        const session = {
          authUserId: authSession.userId,
          householdId: invite.householdId,
          householdName: invite.householdName,
          memberId: existingMemberSnapshot.id,
          memberName: String(data.name),
          memberRole: String(data.role),
        };

        await setDoc(
          doc(db, 'userMemberships', authSession.userId),
          buildUserMembershipDocument(session)
        );

        return session;
      }

      const initials = memberName
        .split(/\s+/)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase() ?? '')
        .join('');

      await setDoc(memberRef, {
        name: memberName,
        initials: initials || 'HB',
        role: 'Household member',
        authUserId: authSession.userId,
        joinedWithInviteCode: inviteCode,
      });

      const session = {
        authUserId: authSession.userId,
        householdId: invite.householdId,
        householdName: invite.householdName,
        memberId: memberRef.id,
        memberName,
        memberRole: 'Household member',
      };

      await setDoc(
        doc(db, 'userMemberships', authSession.userId),
        buildUserMembershipDocument(session)
      );

      return session;
    },
    async restoreSession(authUserId) {
      const membershipSnapshot = await getDoc(doc(db, 'userMemberships', authUserId));

      if (!membershipSnapshot.exists()) {
        return null;
      }

      const membership = membershipSnapshot.data();

      return {
        authUserId,
        householdId: String(membership.householdId),
        householdName: String(membership.householdName),
        memberId: String(membership.memberId),
        memberName: String(membership.memberName),
        memberRole: String(membership.memberRole),
      };
    },
    async syncSession(session) {
      await setDoc(
        doc(db, 'userMemberships', session.authUserId),
        buildUserMembershipDocument(session)
      );
    },
    async createInvite(householdId, createdByMemberId) {
      const householdSnapshot = await getDoc(doc(db, 'households', householdId));

      if (!householdSnapshot.exists()) {
        throw new Error('The household was not found.');
      }

      const householdName = String(householdSnapshot.data().name);
      const inviteRef = doc(collection(db, 'households', householdId, 'invites'));
      const code = normalizeInviteCode(`${householdName} ${inviteRef.id.slice(-5)}`);
      const invite = {
        code,
        householdId,
        householdName,
        createdByMemberId,
        createdAt: new Date().toISOString(),
      };

      const batch = writeBatch(db);
      batch.set(doc(db, 'households', householdId, 'invites', code), invite);
      batch.set(doc(db, 'householdInvites', code), invite);
      await batch.commit();

      return cloneInvite(invite);
    },
    async getLatestInvite(householdId) {
      const inviteSnapshots = await getDocs(
        query(
          collection(db, 'households', householdId, 'invites'),
          orderBy('createdAt', 'desc'),
          limit(1)
        )
      );

      const invite = inviteSnapshots.docs[0];

      if (!invite) {
        return null;
      }

      return mapInvite(invite.id, invite.data() as Record<string, unknown>);
    },
  };
}
