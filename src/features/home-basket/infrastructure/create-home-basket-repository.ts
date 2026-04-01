import { HOME_BASKET_DEMO_INVITE_CODE } from '@/features/home-basket/infrastructure/demo/create-demo-home-basket-snapshot';
import { createDemoHomeBasketDatabase } from '@/features/home-basket/infrastructure/demo/create-demo-home-basket-database';
import {
  getFirebaseStorage,
  getFirestoreDatabase,
} from '@/features/home-basket/infrastructure/firebase/firebase-config';
import { createFirestoreHomeBasketAccessRepository } from '@/features/home-basket/infrastructure/firebase/firestore-home-basket-access-repository';
import { createFirebaseHomeBasketAuthRepository } from '@/features/home-basket/infrastructure/firebase/firebase-home-basket-auth-repository';
import { createFirestoreHomeBasketRepository } from '@/features/home-basket/infrastructure/firebase/firestore-home-basket-repository';
import { createInMemoryHomeBasketAccessRepository } from '@/features/home-basket/infrastructure/in-memory-home-basket-access-repository';
import { createInMemoryHomeBasketRepository } from '@/features/home-basket/infrastructure/in-memory-home-basket-repository';
import { createLocalHomeBasketAuthRepository } from '@/features/home-basket/infrastructure/local-home-basket-auth-repository';

export type RepositoryMode = 'demo' | 'firestore';

export function createHomeBasketServices() {
  const firestoreDb = getFirestoreDatabase();
  const firebaseStorage = getFirebaseStorage();

  if (firestoreDb) {
    return {
      mode: 'firestore' as const,
      authRepository: createFirebaseHomeBasketAuthRepository(),
      homeBasketRepository: createFirestoreHomeBasketRepository(firestoreDb, firebaseStorage),
      accessRepository: createFirestoreHomeBasketAccessRepository(firestoreDb),
      demoInviteCode: null,
    };
  }

  const database = createDemoHomeBasketDatabase();

  return {
    mode: 'demo' as const,
    authRepository: createLocalHomeBasketAuthRepository(),
    homeBasketRepository: createInMemoryHomeBasketRepository(database),
    accessRepository: createInMemoryHomeBasketAccessRepository(database),
    demoInviteCode: HOME_BASKET_DEMO_INVITE_CODE,
  };
}
