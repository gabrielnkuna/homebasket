import AsyncStorage from '@react-native-async-storage/async-storage';

import { HouseholdSession } from '@/features/home-basket/domain/access-models';

const SESSION_STORAGE_KEY = '@home-basket/session';

export async function loadStoredHouseholdSession(): Promise<HouseholdSession | null> {
  const value = await AsyncStorage.getItem(SESSION_STORAGE_KEY);

  if (!value) {
    return null;
  }

  try {
    return JSON.parse(value) as HouseholdSession;
  } catch {
    await AsyncStorage.removeItem(SESSION_STORAGE_KEY);
    return null;
  }
}

export async function saveStoredHouseholdSession(session: HouseholdSession) {
  await AsyncStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
}

export async function clearStoredHouseholdSession() {
  await AsyncStorage.removeItem(SESSION_STORAGE_KEY);
}
