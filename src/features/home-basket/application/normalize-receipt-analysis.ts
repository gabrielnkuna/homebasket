import {
  inferShoppingCategoryFromText,
  normalizeShoppingCategoryLabel,
} from '@/features/home-basket/application/resolve-shopping-category';
import { ReceiptAnalysis } from '@/features/home-basket/domain/models';
import { parseLooseCurrencyToCents } from '@/shared/format/currency';

type ReceiptAnalysisCandidate = {
  merchantName?: unknown;
  totalSpend?: unknown;
  totalSpendText?: unknown;
  totalCandidates?: unknown;
  items?: unknown;
};

const ignoredReceiptLinePatterns = [
  /\bsubtotal\b/i,
  /\bgrand total\b/i,
  /\btotal due\b/i,
  /\bamount due\b/i,
  /\btotal\b/i,
  /\bvat\b/i,
  /\bgst\b/i,
  /\bhst\b/i,
  /\bpst\b/i,
  /\bqst\b/i,
  /\biva\b/i,
  /\bsales tax\b/i,
  /\bservice tax\b/i,
  /\btax\b/i,
  /\bchange\b/i,
  /\bcash\b/i,
  /\bcredit\b/i,
  /\bdebit\b/i,
  /\bvisa\b/i,
  /\bmastercard\b/i,
  /\bamex\b/i,
  /\bcard\b/i,
  /\bbalance\b/i,
  /\btender\b/i,
  /\bdiscount\b/i,
  /\bcoupon\b/i,
  /\bsaving\b/i,
  /\brounding\b/i,
  /\bauthori[sz]ed\b/i,
  /\bapproval\b/i,
  /\btransaction\b/i,
  /\breference\b/i,
  /\bterminal\b/i,
  /\binvoice\b/i,
];

const rejectedTotalLinePatterns = [
  /\bsubtotal\b/i,
  /\bvat\b/i,
  /\bgst\b/i,
  /\bhst\b/i,
  /\bpst\b/i,
  /\bqst\b/i,
  /\biva\b/i,
  /\bsales tax\b/i,
  /\bservice tax\b/i,
  /\btax\b/i,
  /\bdiscount\b/i,
  /\bcoupon\b/i,
  /\bsaving\b/i,
  /\bchange\b/i,
  /\bbalance\b/i,
];

const preferredTotalLinePatterns = [
  /\bgrand total\b/i,
  /\btotal due\b/i,
  /\bamount due\b/i,
  /\bamount paid\b/i,
  /\bpaid\b/i,
  /\bto pay\b/i,
  /\bsale total\b/i,
  /\btotal\b/i,
];

function parseTotalSpendCents(value: unknown) {
  return parseLooseCurrencyToCents(typeof value === 'number' ? value : String(value ?? '')) ?? undefined;
}

function parseBestTextTotalSpendCents(values: unknown[]) {
  const stringCandidates = values
    .filter((value): value is string => typeof value === 'string' && value.trim().length > 0)
    .map((value) => value.trim());

  for (const value of stringCandidates) {
    if (
      preferredTotalLinePatterns.some((pattern) => pattern.test(value)) &&
      !rejectedTotalLinePatterns.some((pattern) => pattern.test(value))
    ) {
      const parsedValue = parseTotalSpendCents(value);

      if (parsedValue) {
        return parsedValue;
      }
    }
  }

  for (const value of stringCandidates) {
    if (rejectedTotalLinePatterns.some((pattern) => pattern.test(value))) {
      continue;
    }

    const parsedValue = parseTotalSpendCents(value);

    if (parsedValue) {
      return parsedValue;
    }
  }

  return undefined;
}

function parseDetectedTotalSpendCents(candidate: ReceiptAnalysisCandidate) {
  const directTotal = parseTotalSpendCents(candidate.totalSpend);

  if (directTotal) {
    return directTotal;
  }

  return parseBestTextTotalSpendCents([
    candidate.totalSpendText,
    ...(Array.isArray(candidate.totalCandidates) ? candidate.totalCandidates : []),
  ]);
}

function normalizeMerchantName(value: unknown) {
  if (typeof value !== 'string') {
    return undefined;
  }

  const cleanedValue = value.trim().replace(/\s+/g, ' ').replace(/^[^A-Za-z0-9]+/, '');

  return cleanedValue || undefined;
}

function cleanupReceiptItemName(value: string) {
  return value
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/[|;]+/g, ' ')
    .replace(/^[^A-Za-z0-9]+/, '')
    .replace(/\s+[A-Z]{0,3}?\d+[.,]\d{2}\s*$/i, '')
    .replace(/\s+\d+[.,]\d{2}\s*$/i, '')
    .trim();
}

function inferQuantityFromName(name: string) {
  const leadingCount = name.match(/^(\d+(?:[.,]\d+)?)\s*[xX]\s+(.+)$/);

  if (leadingCount) {
    return {
      quantity: leadingCount[1].replace(',', '.'),
      name: leadingCount[2].trim(),
    };
  }

  const trailingCount = name.match(/^(.+?)\s+[xX]\s*(\d+(?:[.,]\d+)?)$/);

  if (trailingCount) {
    return {
      quantity: trailingCount[2].replace(',', '.'),
      name: trailingCount[1].trim(),
    };
  }

  const leadingMeasure = name.match(/^(\d+(?:[.,]\d+)?)\s*(kg|g|l|ml|lb|oz|pack|packs|pk|ct)\b\s+(.+)$/i);

  if (leadingMeasure) {
    return {
      quantity: `${leadingMeasure[1].replace(',', '.')} ${leadingMeasure[2].toUpperCase()}`,
      name: leadingMeasure[3].trim(),
    };
  }

  const trailingMeasure = name.match(/^(.+?)\s+(\d+(?:[.,]\d+)?)\s*(kg|g|l|ml|lb|oz|pack|packs|pk|ct)$/i);

  if (trailingMeasure) {
    return {
      quantity: `${trailingMeasure[2].replace(',', '.')} ${trailingMeasure[3].toUpperCase()}`,
      name: trailingMeasure[1].trim(),
    };
  }

  return {
    quantity: null,
    name,
  };
}

function normalizeReceiptItem(candidate: unknown) {
  if (!candidate || typeof candidate !== 'object') {
    return null;
  }

  const item = candidate as Record<string, unknown>;
  const rawName = typeof item.name === 'string' ? cleanupReceiptItemName(item.name) : '';
  const inferredQuantity = inferQuantityFromName(rawName);
  const name = cleanupReceiptItemName(inferredQuantity.name);

  if (
    !name ||
    name.length < 2 ||
    /^[\d\s.,/-]+$/.test(name) ||
    ignoredReceiptLinePatterns.some((pattern) => pattern.test(name))
  ) {
    return null;
  }

  const quantity =
    typeof item.quantity === 'string' && item.quantity.trim()
      ? item.quantity.trim()
      : inferredQuantity.quantity ?? '1';
  const providedCategory =
    typeof item.category === 'string' ? normalizeShoppingCategoryLabel(item.category) : '';
  const category =
    providedCategory && providedCategory !== 'Other'
      ? providedCategory
      : inferShoppingCategoryFromText(name);

  return {
    name,
    quantity,
    category: category || 'Other',
  };
}

export function normalizeReceiptAnalysis(candidate: ReceiptAnalysisCandidate): ReceiptAnalysis {
  const merchantName = normalizeMerchantName(candidate.merchantName);
  const detectedTotalSpendCents = parseDetectedTotalSpendCents(candidate);
  const items = Array.isArray(candidate.items)
    ? candidate.items.map(normalizeReceiptItem).filter((item) => item !== null).slice(0, 30)
    : [];

  return {
    merchantName,
    detectedTotalSpendCents,
    items,
  };
}
