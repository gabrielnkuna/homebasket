import { describe, expect, it } from 'vitest';

import { parseLooseCurrencyToCents } from '@/shared/format/currency';

describe('parseLooseCurrencyToCents', () => {
  it('parses comma-decimal values', () => {
    expect(parseLooseCurrencyToCents('R 163,26')).toBe(16326);
  });

  it('parses dot-decimal values with comma thousands separators', () => {
    expect(parseLooseCurrencyToCents('$1,234.56')).toBe(123456);
  });

  it('parses comma-decimal values with dot thousands separators', () => {
    expect(parseLooseCurrencyToCents('EUR 1.234,56')).toBe(123456);
  });

  it('parses whole amounts without decimals', () => {
    expect(parseLooseCurrencyToCents('1234')).toBe(123400);
  });
});
