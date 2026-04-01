import { describe, expect, it } from 'vitest';

import {
  normalizeAccountEmail,
  validateEmailPasswordLinkInput,
  validatePasswordResetEmailInput,
  validateEmailPasswordSignInInput,
} from '@/features/home-basket/application/account-credentials';

describe('account credentials', () => {
  it('normalizes email addresses for account actions', () => {
    expect(normalizeAccountEmail('  Naledi@Example.com  ')).toBe('naledi@example.com');
  });

  it('requires an email and password for sign-in', () => {
    expect(
      validateEmailPasswordSignInInput({
        email: '   ',
        password: '',
      })
    ).toBe('Enter your email address.');

    expect(
      validateEmailPasswordSignInInput({
        email: 'naledi@example.com',
        password: '',
      })
    ).toBe('Enter your password.');
  });

  it('requires a stronger confirmed password when linking an account', () => {
    expect(
      validateEmailPasswordLinkInput({
        email: 'naledi@example.com',
        password: '12345',
        confirmPassword: '12345',
      })
    ).toBe('Use a password with at least 6 characters.');

    expect(
      validateEmailPasswordLinkInput({
        email: 'naledi@example.com',
        password: '123456',
        confirmPassword: '654321',
      })
    ).toBe('Passwords do not match yet.');

    expect(
      validateEmailPasswordLinkInput({
        email: 'naledi@example.com',
        password: '123456',
        confirmPassword: '123456',
      })
    ).toBeNull();
  });

  it('requires an email before sending a password reset', () => {
    expect(validatePasswordResetEmailInput('   ')).toBe('Enter your email address.');
    expect(validatePasswordResetEmailInput('naledi@example.com')).toBeNull();
  });
});
