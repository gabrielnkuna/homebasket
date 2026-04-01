import { FirebaseError } from 'firebase/app';
import {
  Auth,
  EmailAuthProvider,
  linkWithCredential,
  onAuthStateChanged,
  reload,
  sendEmailVerification as sendFirebaseEmailVerification,
  sendPasswordResetEmail as sendFirebasePasswordResetEmail,
  signInAnonymously,
  signInWithEmailAndPassword,
  signOut as signOutFirebaseUser,
} from 'firebase/auth';

import { HomeBasketAuthRepository } from '@/features/home-basket/domain/auth-repository';
import { EmailPasswordAccountInput, HomeBasketAuthSession } from '@/features/home-basket/domain/auth-models';
import { normalizeAccountEmail } from '@/features/home-basket/application/account-credentials';
import { getFirebaseAuthentication } from '@/features/home-basket/infrastructure/firebase/firebase-config';

function mapAuthSession(auth: Auth): HomeBasketAuthSession {
  const user = auth.currentUser;

  if (!user) {
    throw new Error('No Firebase user is available for Home Basket.');
  }

  return {
    userId: user.uid,
    provider: user.isAnonymous ? 'firebase-anonymous' : 'firebase-email-password',
    email: user.email ?? null,
    emailVerified: user.emailVerified,
  };
}

async function waitForResolvedAuthState(auth: Auth) {
  if (auth.currentUser) {
    return auth.currentUser;
  }

  return new Promise<Auth['currentUser']>((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe();
      resolve(user);
    });
  });
}

function mapAuthErrorMessage(error: unknown, action: 'sign-in' | 'link') {
  if (!(error instanceof FirebaseError)) {
    return action === 'sign-in'
      ? 'Unable to sign in with that Home Basket account right now.'
      : 'Unable to link this Home Basket account right now.';
  }

  switch (error.code) {
    case 'auth/invalid-email':
      return 'Enter a valid email address.';
    case 'auth/weak-password':
      return 'Use a password with at least 6 characters.';
    case 'auth/operation-not-allowed':
      return 'Enable Email/Password sign-in in Firebase Authentication before testing this flow.';
    case 'auth/email-already-in-use':
    case 'auth/credential-already-in-use':
      return action === 'link'
        ? 'That email is already linked to another Home Basket login. Sign in with that account instead.'
        : 'That email is already in use. Try signing in with the existing password.';
    case 'auth/provider-already-linked':
      return 'This device is already linked to an email and password.';
    case 'auth/invalid-credential':
    case 'auth/user-not-found':
    case 'auth/wrong-password':
      return 'That email and password did not match a Home Basket account.';
    case 'auth/too-many-requests':
      return 'Firebase temporarily slowed this auth action after too many attempts. Wait a moment and try again.';
    default:
      return error.message || (action === 'sign-in'
        ? 'Unable to sign in with that Home Basket account right now.'
        : 'Unable to link this Home Basket account right now.');
  }
}

function mapPasswordResetErrorMessage(error: unknown) {
  if (!(error instanceof FirebaseError)) {
    return 'Unable to send the password reset email right now.';
  }

  switch (error.code) {
    case 'auth/invalid-email':
      return 'Enter a valid email address.';
    case 'auth/missing-email':
      return 'Enter your email address.';
    case 'auth/operation-not-allowed':
      return 'Enable Email/Password sign-in in Firebase Authentication before testing password reset.';
    case 'auth/too-many-requests':
      return 'Firebase temporarily slowed password reset emails after too many attempts. Wait a moment and try again.';
    default:
      return error.message || 'Unable to send the password reset email right now.';
  }
}

function normalizeAccountInput(input: EmailPasswordAccountInput) {
  return {
    email: normalizeAccountEmail(input.email),
    password: input.password,
  };
}

function mapVerificationErrorMessage(error: unknown) {
  if (!(error instanceof FirebaseError)) {
    return 'Unable to send the verification email right now.';
  }

  switch (error.code) {
    case 'auth/too-many-requests':
      return 'Firebase temporarily slowed verification emails after too many attempts. Wait a moment and try again.';
    case 'auth/operation-not-allowed':
      return 'Enable Email/Password sign-in in Firebase Authentication before testing email verification.';
    default:
      return error.message || 'Unable to send the verification email right now.';
  }
}

async function refreshCurrentUser(auth: Auth) {
  if (!auth.currentUser) {
    await signInAnonymously(auth);
    return mapAuthSession(auth);
  }

  if (!auth.currentUser.isAnonymous) {
    await reload(auth.currentUser);
  }

  return mapAuthSession(auth);
}

export function createFirebaseHomeBasketAuthRepository(): HomeBasketAuthRepository {
  return {
    async ensureSignedIn() {
      const auth = await getFirebaseAuthentication();
      await waitForResolvedAuthState(auth);

      if (!auth.currentUser) {
        await signInAnonymously(auth);
      }

      return refreshCurrentUser(auth);
    },
    async refreshSession() {
      const auth = await getFirebaseAuthentication();
      await waitForResolvedAuthState(auth);

      return refreshCurrentUser(auth);
    },
    async signInWithEmailPassword(input) {
      const auth = await getFirebaseAuthentication();
      const credentials = normalizeAccountInput(input);

      await waitForResolvedAuthState(auth);

      try {
        await signInWithEmailAndPassword(auth, credentials.email, credentials.password);
      } catch (error) {
        throw new Error(mapAuthErrorMessage(error, 'sign-in'));
      }

      return refreshCurrentUser(auth);
    },
    async linkWithEmailPassword(input) {
      const auth = await getFirebaseAuthentication();
      const credentials = normalizeAccountInput(input);

      await waitForResolvedAuthState(auth);

      if (!auth.currentUser) {
        await signInAnonymously(auth);
      }

      try {
        await linkWithCredential(
          auth.currentUser!,
          EmailAuthProvider.credential(credentials.email, credentials.password)
        );
      } catch (error) {
        throw new Error(mapAuthErrorMessage(error, 'link'));
      }

      return refreshCurrentUser(auth);
    },
    async sendPasswordResetEmail(email) {
      const auth = await getFirebaseAuthentication();

      try {
        await sendFirebasePasswordResetEmail(auth, normalizeAccountEmail(email));
      } catch (error) {
        throw new Error(mapPasswordResetErrorMessage(error));
      }
    },
    async sendEmailVerification() {
      const auth = await getFirebaseAuthentication();
      await waitForResolvedAuthState(auth);

      if (!auth.currentUser || auth.currentUser.isAnonymous || !auth.currentUser.email) {
        throw new Error('Link an email and password to this device before sending verification.');
      }

      await reload(auth.currentUser);

      if (auth.currentUser.emailVerified) {
        return;
      }

      try {
        await sendFirebaseEmailVerification(auth.currentUser);
      } catch (error) {
        throw new Error(mapVerificationErrorMessage(error));
      }
    },
    async signOut() {
      const auth = await getFirebaseAuthentication();
      await signOutFirebaseUser(auth);
      await signInAnonymously(auth);
      return refreshCurrentUser(auth);
    },
  };
}
