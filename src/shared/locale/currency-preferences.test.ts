import { describe, expect, it } from 'vitest';

import {
  coerceCurrencyCode,
  getSuggestedCurrencyCodes,
  normalizeCurrencyCode,
  normalizeCurrencyInput,
  resolveCurrencyCodeFromRegion,
} from '@/shared/locale/currency-preferences';

describe('currency preferences', () => {
  it('maps regions to currencies for common global markets', () => {
    expect(resolveCurrencyCodeFromRegion('ZA')).toBe('ZAR');
    expect(resolveCurrencyCodeFromRegion('US')).toBe('USD');
    expect(resolveCurrencyCodeFromRegion('DE')).toBe('EUR');
    expect(resolveCurrencyCodeFromRegion('JP')).toBe('JPY');
  });

  it('normalizes and validates currency codes', () => {
    expect(normalizeCurrencyCode(' usd ')).toBe('USD');
    expect(() => normalizeCurrencyCode('home')).toThrow(
      'Choose a valid 3-letter currency code, like USD, EUR, or ZAR.'
    );
  });

  it('coerces unsupported stored values to a safe fallback', () => {
    expect(coerceCurrencyCode('zar', 'USD')).toBe('ZAR');
    expect(coerceCurrencyCode('home', 'USD')).toBe('USD');
  });

  it('builds a practical suggested currency list with the preferred code first', () => {
    const suggestedCodes = getSuggestedCurrencyCodes('KES');

    expect(suggestedCodes[0]).toBe('KES');
    expect(suggestedCodes).toContain('USD');
    expect(suggestedCodes).toContain('EUR');
  });

  it('normalizes free-text currency input to ISO-style codes', () => {
    expect(normalizeCurrencyInput('usd')).toBe('USD');
    expect(normalizeCurrencyInput('zar123')).toBe('ZAR');
    expect(normalizeCurrencyInput('euro')).toBe('EUR');
  });
});
