import { EmailPasswordAccountInput } from '@/features/home-basket/domain/auth-models';

export interface LinkEmailPasswordAccountInput extends EmailPasswordAccountInput {
  confirmPassword: string;
}

export function normalizeAccountEmail(email: string) {
  return email.trim().toLowerCase();
}

export function validateEmailPasswordSignInInput(input: EmailPasswordAccountInput) {
  const emailValidation = validatePasswordResetEmailInput(input.email);

  if (emailValidation) {
    return emailValidation;
  }

  if (!input.password) {
    return 'Enter your password.';
  }

  return null;
}

export function validateEmailPasswordLinkInput(input: LinkEmailPasswordAccountInput) {
  const signInValidation = validateEmailPasswordSignInInput(input);

  if (signInValidation) {
    return signInValidation;
  }

  if (input.password.length < 6) {
    return 'Use a password with at least 6 characters.';
  }

  if (input.confirmPassword !== input.password) {
    return 'Passwords do not match yet.';
  }

  return null;
}

export function validatePasswordResetEmailInput(email: string) {
  if (!normalizeAccountEmail(email)) {
    return 'Enter your email address.';
  }

  return null;
}
