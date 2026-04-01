import { FirebaseApp, FirebaseOptions, getApp, getApps, initializeApp } from 'firebase/app';
import { Firestore, getFirestore } from 'firebase/firestore';
import { FirebaseStorage, getStorage } from 'firebase/storage';

import { getPlatformFirebaseAuth } from '@/features/home-basket/infrastructure/firebase/firebase-auth';

let firebaseApp: FirebaseApp | null = null;
let firestoreDb: Firestore | null = null;
let firebaseStorage: FirebaseStorage | null = null;

export function getFirebaseOptionsFromEnv(): FirebaseOptions | null {
  const apiKey = process.env.EXPO_PUBLIC_FIREBASE_API_KEY;
  const authDomain = process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN;
  const projectId = process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID;
  const storageBucket = process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET;
  const messagingSenderId = process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID;
  const appId = process.env.EXPO_PUBLIC_FIREBASE_APP_ID;
  const measurementId = process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID;

  if (
    !apiKey ||
    !authDomain ||
    !projectId ||
    !storageBucket ||
    !messagingSenderId ||
    !appId
  ) {
    return null;
  }

  return {
    apiKey,
    authDomain,
    projectId,
    storageBucket,
    messagingSenderId,
    appId,
    measurementId: measurementId || undefined,
  };
}

export function getFirestoreDatabase() {
  const app = getFirebaseApp();

  if (!app) {
    return null;
  }

  if (firestoreDb) {
    return firestoreDb;
  }

  firestoreDb = getFirestore(app);

  return firestoreDb;
}

export function getFirebaseStorage() {
  const app = getFirebaseApp();

  if (!app) {
    return null;
  }

  if (firebaseStorage) {
    return firebaseStorage;
  }

  firebaseStorage = getStorage(app);

  return firebaseStorage;
}

export function getFirebaseApp() {
  const config = getFirebaseOptionsFromEnv();

  if (!config) {
    return null;
  }

  if (firebaseApp) {
    return firebaseApp;
  }

  firebaseApp = getApps().length > 0 ? getApp() : initializeApp(config);

  return firebaseApp;
}

export async function getFirebaseAuthentication() {
  const app = getFirebaseApp();

  if (!app) {
    throw new Error('Firebase authentication is not configured for Home Basket.');
  }

  return getPlatformFirebaseAuth(app);
}
