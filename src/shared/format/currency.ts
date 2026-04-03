import {
  getDefaultCurrencyCode,
  getDeviceLocale,
} from '@/shared/locale/currency-preferences';

export function formatCurrency(
  cents: number,
  currencyCode = getDefaultCurrencyCode(),
  locale = getDeviceLocale()
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currencyCode,
    maximumFractionDigits: 2,
  }).format(cents / 100);
}

export function parseLooseCurrencyToCents(value: string | number): number | null {
  if (typeof value === 'number') {
    if (!Number.isFinite(value) || value <= 0) {
      return null;
    }

    return Math.round(value * 100);
  }

  const trimmedValue = value.trim();

  if (!trimmedValue) {
    return null;
  }

  const normalized = trimmedValue
    .replace(/\((.+)\)/, '-$1')
    .replace(/[^0-9,.'\-\s]/g, '')
    .replace(/['\s]/g, '')
    .replace(/-/g, '');

  if (!normalized) {
    return null;
  }

  const lastDot = normalized.lastIndexOf('.');
  const lastComma = normalized.lastIndexOf(',');
  const decimalSeparator =
    lastDot === -1 && lastComma === -1
      ? null
      : lastDot > lastComma
        ? '.'
        : ',';

  let canonicalNumber = normalized;

  if (decimalSeparator) {
    const lastSeparatorIndex = canonicalNumber.lastIndexOf(decimalSeparator);
    const digitsAfterSeparator = canonicalNumber.length - lastSeparatorIndex - 1;
    const separatorOccurrences = canonicalNumber.split(decimalSeparator).length - 1;

    if (
      digitsAfterSeparator === 0 ||
      (digitsAfterSeparator === 3 && separatorOccurrences === 1) ||
      digitsAfterSeparator > 3
    ) {
      canonicalNumber = canonicalNumber.replace(/[.,]/g, '');
    } else {
      const thousandsSeparator = decimalSeparator === '.' ? /,/g : /\./g;

      canonicalNumber = canonicalNumber
        .replace(thousandsSeparator, '')
        .replace(decimalSeparator, '.');
    }
  }

  const amount = Number(canonicalNumber);

  if (!Number.isFinite(amount) || amount <= 0) {
    return null;
  }

  return Math.round(amount * 100);
}

export function parseCurrencyInput(value: string): number | null {
  return parseLooseCurrencyToCents(value);
}

export function formatCurrencyInputValue(cents: number): string {
  return (cents / 100).toFixed(2);
}
