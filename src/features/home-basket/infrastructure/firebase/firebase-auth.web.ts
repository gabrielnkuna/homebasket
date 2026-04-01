import { FirebaseApp } from 'firebase/app';
import { Auth, browserLocalPersistence, getAuth, setPersistence } from 'firebase/auth';

let authPromise: Promise<Auth> | null = null;

export async function getPlatformFirebaseAuth(app: FirebaseApp): Promise<Auth> {
  if (authPromise) {
    return authPromise;
  }

  authPromise = (async () => {
    const auth = getAuth(app);
    await setPersistence(auth, browserLocalPersistence);
    return auth;
  })();

  return authPromise;
}
