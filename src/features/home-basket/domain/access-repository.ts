import {
  CreateHouseholdInput,
  HouseholdInvite,
  HouseholdSession,
  JoinHouseholdInput,
} from '@/features/home-basket/domain/access-models';
import { HomeBasketAuthSession } from '@/features/home-basket/domain/auth-models';

export interface CreateHouseholdResult {
  session: HouseholdSession;
  invite: HouseholdInvite;
}

export interface HomeBasketAccessRepository {
  createHousehold(
    input: CreateHouseholdInput,
    authSession: HomeBasketAuthSession
  ): Promise<CreateHouseholdResult>;
  joinHousehold(
    input: JoinHouseholdInput,
    authSession: HomeBasketAuthSession
  ): Promise<HouseholdSession>;
  restoreSession(authUserId: string): Promise<HouseholdSession | null>;
  syncSession(session: HouseholdSession): Promise<void>;
  createInvite(householdId: string, createdByMemberId: string): Promise<HouseholdInvite>;
  getLatestInvite(householdId: string): Promise<HouseholdInvite | null>;
}
