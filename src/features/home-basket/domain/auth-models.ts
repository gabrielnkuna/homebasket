export type HomeBasketAuthProvider =
  | 'firebase-anonymous'
  | 'firebase-email-password'
  | 'demo-device';

export interface HomeBasketAuthSession {
  userId: string;
  provider: HomeBasketAuthProvider;
  email: string | null;
  emailVerified: boolean;
}

export interface EmailPasswordAccountInput {
  email: string;
  password: string;
}
