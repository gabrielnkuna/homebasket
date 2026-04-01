function daysInUtcMonth(year: number, monthIndex: number) {
  return new Date(Date.UTC(year, monthIndex + 1, 0)).getUTCDate();
}

function createUtcDate(year: number, monthIndex: number, day: number) {
  return new Date(Date.UTC(year, monthIndex, day, 0, 0, 0, 0));
}

export function normalizeBudgetCycleAnchorDay(anchorDay: number) {
  const normalizedDay = Math.trunc(anchorDay);

  if (!Number.isFinite(normalizedDay) || normalizedDay < 1 || normalizedDay > 31) {
    throw new Error('Enter a pay day between 1 and 31.');
  }

  return normalizedDay;
}

function resolveAnchorDate(year: number, monthIndex: number, anchorDay: number) {
  return createUtcDate(year, monthIndex, Math.min(anchorDay, daysInUtcMonth(year, monthIndex)));
}

function shiftUtcMonth(year: number, monthIndex: number, delta: number) {
  const shiftedDate = new Date(Date.UTC(year, monthIndex + delta, 1));

  return {
    year: shiftedDate.getUTCFullYear(),
    monthIndex: shiftedDate.getUTCMonth(),
  };
}

export function getBudgetCycleWindow(referenceDate: Date, anchorDay: number) {
  const normalizedAnchorDay = normalizeBudgetCycleAnchorDay(anchorDay);
  const reference = new Date(referenceDate);
  const currentMonthAnchor = resolveAnchorDate(
    reference.getUTCFullYear(),
    reference.getUTCMonth(),
    normalizedAnchorDay
  );
  const startsInCurrentMonth = reference >= currentMonthAnchor;
  const startMonth = startsInCurrentMonth
    ? {
        year: reference.getUTCFullYear(),
        monthIndex: reference.getUTCMonth(),
      }
    : shiftUtcMonth(reference.getUTCFullYear(), reference.getUTCMonth(), -1);
  const nextMonth = shiftUtcMonth(startMonth.year, startMonth.monthIndex, 1);
  const startDate = resolveAnchorDate(startMonth.year, startMonth.monthIndex, normalizedAnchorDay);
  const nextStartDate = resolveAnchorDate(nextMonth.year, nextMonth.monthIndex, normalizedAnchorDay);

  return {
    startDate,
    nextStartDate,
  };
}

export function isInBudgetCycle(
  input: string,
  referenceDate: Date,
  anchorDay: number
) {
  const candidateDate = new Date(input);
  const window = getBudgetCycleWindow(referenceDate, anchorDay);

  return candidateDate >= window.startDate && candidateDate < window.nextStartDate;
}

export function formatBudgetCycleRange(referenceDate: Date, anchorDay: number, locale = 'en-ZA') {
  const window = getBudgetCycleWindow(referenceDate, anchorDay);
  const cycleEndDate = new Date(window.nextStartDate.getTime() - 24 * 60 * 60 * 1000);
  const formatter = new Intl.DateTimeFormat(locale, {
    day: 'numeric',
    month: 'short',
  });

  return `${formatter.format(window.startDate)} - ${formatter.format(cycleEndDate)}`;
}

export function formatOrdinalDay(value: number) {
  const normalizedValue = normalizeBudgetCycleAnchorDay(value);
  const remainderTen = normalizedValue % 10;
  const remainderHundred = normalizedValue % 100;

  if (remainderTen === 1 && remainderHundred !== 11) {
    return `${normalizedValue}st`;
  }

  if (remainderTen === 2 && remainderHundred !== 12) {
    return `${normalizedValue}nd`;
  }

  if (remainderTen === 3 && remainderHundred !== 13) {
    return `${normalizedValue}rd`;
  }

  return `${normalizedValue}th`;
}
