import { FirebaseApp } from 'firebase/app';
import { Auth, getAuth } from 'firebase/auth';

export async function getPlatformFirebaseAuth(app: FirebaseApp): Promise<Auth> {
  return getAuth(app);
}
