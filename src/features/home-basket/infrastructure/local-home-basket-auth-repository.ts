import AsyncStorage from '@react-native-async-storage/async-storage';

import { HomeBasketAuthRepository } from '@/features/home-basket/domain/auth-repository';
import { HomeBasketAuthSession } from '@/features/home-basket/domain/auth-models';

const AUTH_STORAGE_KEY = '@home-basket/auth-user';

function createDeviceUserId() {
  return `demo-user-${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36).slice(-4)}`;
}

async function readStoredUserId() {
  return AsyncStorage.getItem(AUTH_STORAGE_KEY);
}

async function saveUserId(userId: string) {
  await AsyncStorage.setItem(AUTH_STORAGE_KEY, userId);
}

async function createSession() {
  const userId = createDeviceUserId();
  await saveUserId(userId);

  return {
    userId,
    provider: 'demo-device',
    email: null,
    emailVerified: false,
  } satisfies HomeBasketAuthSession;
}

export function createLocalHomeBasketAuthRepository(): HomeBasketAuthRepository {
  return {
    async ensureSignedIn() {
      const storedUserId = await readStoredUserId();

      if (storedUserId) {
        return {
          userId: storedUserId,
          provider: 'demo-device',
          email: null,
          emailVerified: false,
        };
      }

      return createSession();
    },
    async refreshSession() {
      const storedUserId = await readStoredUserId();

      if (storedUserId) {
        return {
          userId: storedUserId,
          provider: 'demo-device',
          email: null,
          emailVerified: false,
        };
      }

      return createSession();
    },
    async signInWithEmailPassword() {
      throw new Error('Email sign-in is only available when Firebase sync is configured.');
    },
    async linkWithEmailPassword() {
      throw new Error('Email sign-in is only available when Firebase sync is configured.');
    },
    async sendPasswordResetEmail() {
      throw new Error('Password reset is only available when Firebase sync is configured.');
    },
    async sendEmailVerification() {
      throw new Error('Email verification is only available when Firebase sync is configured.');
    },
    async signOut() {
      await AsyncStorage.removeItem(AUTH_STORAGE_KEY);
      return createSession();
    },
  };
}
