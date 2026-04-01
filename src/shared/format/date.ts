export function formatShortDate(input: string, locale = 'en-ZA'): string {
  return new Intl.DateTimeFormat(locale, {
    day: 'numeric',
    month: 'short',
  }).format(new Date(input));
}

export function formatLongDate(input: string, locale = 'en-ZA'): string {
  return new Intl.DateTimeFormat(locale, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(input));
}

function padNumber(value: number) {
  return value.toString().padStart(2, '0');
}

export function formatDateInputValue(input: string | Date) {
  const value = input instanceof Date ? input : new Date(input);

  return `${value.getFullYear()}-${padNumber(value.getMonth() + 1)}-${padNumber(value.getDate())}`;
}

export function parseDateInputValue(input: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(input.trim());

  if (!match) {
    return null;
  }

  const year = Number(match[1]);
  const monthIndex = Number(match[2]) - 1;
  const day = Number(match[3]);
  const value = new Date(Date.UTC(year, monthIndex, day, 12, 0, 0, 0));

  if (
    Number.isNaN(value.getTime()) ||
    value.getUTCFullYear() !== year ||
    value.getUTCMonth() !== monthIndex ||
    value.getUTCDate() !== day
  ) {
    return null;
  }

  return value.toISOString();
}

export function isSameCalendarMonth(input: string, referenceDate: Date): boolean {
  const candidate = new Date(input);

  return (
    candidate.getUTCFullYear() === referenceDate.getUTCFullYear() &&
    candidate.getUTCMonth() === referenceDate.getUTCMonth()
  );
}
