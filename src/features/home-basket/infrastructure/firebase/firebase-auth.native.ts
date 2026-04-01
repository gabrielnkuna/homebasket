import AsyncStorage from '@react-native-async-storage/async-storage';
import { getReactNativePersistence } from '@firebase/auth/dist/rn/index.js';
import { FirebaseApp } from 'firebase/app';
import { Auth, getAuth, initializeAuth } from 'firebase/auth';

let auth: Auth | null = null;

export async function getPlatformFirebaseAuth(app: FirebaseApp): Promise<Auth> {
  if (auth) {
    return auth;
  }

  try {
    auth = initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage),
    });
  } catch {
    auth = getAuth(app);
  }

  return auth;
}
