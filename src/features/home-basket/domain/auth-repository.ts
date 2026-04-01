import {
  EmailPasswordAccountInput,
  HomeBasketAuthSession,
} from '@/features/home-basket/domain/auth-models';

export interface HomeBasketAuthRepository {
  ensureSignedIn(): Promise<HomeBasketAuthSession>;
  refreshSession(): Promise<HomeBasketAuthSession>;
  signInWithEmailPassword(input: EmailPasswordAccountInput): Promise<HomeBasketAuthSession>;
  linkWithEmailPassword(input: EmailPasswordAccountInput): Promise<HomeBasketAuthSession>;
  sendPasswordResetEmail(email: string): Promise<void>;
  sendEmailVerification(): Promise<void>;
  signOut(): Promise<HomeBasketAuthSession>;
}
