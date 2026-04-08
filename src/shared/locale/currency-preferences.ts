const FALLBACK_LOCALE = 'en-US';
const FALLBACK_CURRENCY_CODE = 'USD';

const REGION_TO_CURRENCY: Record<string, string> = {
  AD: 'EUR',
  AE: 'AED',
  AF: 'AFN',
  AG: 'XCD',
  AI: 'XCD',
  AL: 'ALL',
  AM: 'AMD',
  AO: 'AOA',
  AR: 'ARS',
  AS: 'USD',
  AT: 'EUR',
  AU: 'AUD',
  AW: 'AWG',
  AX: 'EUR',
  AZ: 'AZN',
  BA: 'BAM',
  BB: 'BBD',
  BD: 'BDT',
  BE: 'EUR',
  BF: 'XOF',
  BG: 'BGN',
  BH: 'BHD',
  BI: 'BIF',
  BJ: 'XOF',
  BL: 'EUR',
  BM: 'BMD',
  BN: 'BND',
  BO: 'BOB',
  BQ: 'USD',
  BR: 'BRL',
  BS: 'BSD',
  BT: 'BTN',
  BW: 'BWP',
  BY: 'BYN',
  BZ: 'BZD',
  CA: 'CAD',
  CC: 'AUD',
  CD: 'CDF',
  CF: 'XAF',
  CG: 'XAF',
  CH: 'CHF',
  CI: 'XOF',
  CK: 'NZD',
  CL: 'CLP',
  CM: 'XAF',
  CN: 'CNY',
  CO: 'COP',
  CR: 'CRC',
  CU: 'CUP',
  CV: 'CVE',
  CW: 'ANG',
  CY: 'EUR',
  CZ: 'CZK',
  DE: 'EUR',
  DJ: 'DJF',
  DK: 'DKK',
  DM: 'XCD',
  DO: 'DOP',
  DZ: 'DZD',
  EC: 'USD',
  EE: 'EUR',
  EG: 'EGP',
  EH: 'MAD',
  ER: 'ERN',
  ES: 'EUR',
  ET: 'ETB',
  FI: 'EUR',
  FJ: 'FJD',
  FK: 'FKP',
  FM: 'USD',
  FO: 'DKK',
  FR: 'EUR',
  GA: 'XAF',
  GB: 'GBP',
  GD: 'XCD',
  GE: 'GEL',
  GF: 'EUR',
  GG: 'GBP',
  GH: 'GHS',
  GI: 'GIP',
  GL: 'DKK',
  GM: 'GMD',
  GN: 'GNF',
  GP: 'EUR',
  GQ: 'XAF',
  GR: 'EUR',
  GT: 'GTQ',
  GU: 'USD',
  GW: 'XOF',
  GY: 'GYD',
  HK: 'HKD',
  HN: 'HNL',
  HR: 'EUR',
  HT: 'HTG',
  HU: 'HUF',
  ID: 'IDR',
  IE: 'EUR',
  IL: 'ILS',
  IM: 'GBP',
  IN: 'INR',
  IO: 'USD',
  IQ: 'IQD',
  IR: 'IRR',
  IS: 'ISK',
  IT: 'EUR',
  JE: 'GBP',
  JM: 'JMD',
  JO: 'JOD',
  JP: 'JPY',
  KE: 'KES',
  KG: 'KGS',
  KH: 'KHR',
  KI: 'AUD',
  KM: 'KMF',
  KN: 'XCD',
  KP: 'KPW',
  KR: 'KRW',
  KW: 'KWD',
  KY: 'KYD',
  KZ: 'KZT',
  LA: 'LAK',
  LB: 'LBP',
  LC: 'XCD',
  LI: 'CHF',
  LK: 'LKR',
  LR: 'LRD',
  LS: 'LSL',
  LT: 'EUR',
  LU: 'EUR',
  LV: 'EUR',
  LY: 'LYD',
  MA: 'MAD',
  MC: 'EUR',
  MD: 'MDL',
  ME: 'EUR',
  MF: 'EUR',
  MG: 'MGA',
  MH: 'USD',
  MK: 'MKD',
  ML: 'XOF',
  MM: 'MMK',
  MN: 'MNT',
  MO: 'MOP',
  MP: 'USD',
  MQ: 'EUR',
  MR: 'MRU',
  MS: 'XCD',
  MT: 'EUR',
  MU: 'MUR',
  MV: 'MVR',
  MW: 'MWK',
  MX: 'MXN',
  MY: 'MYR',
  MZ: 'MZN',
  NA: 'NAD',
  NC: 'XPF',
  NE: 'XOF',
  NF: 'AUD',
  NG: 'NGN',
  NI: 'NIO',
  NL: 'EUR',
  NO: 'NOK',
  NP: 'NPR',
  NR: 'AUD',
  NU: 'NZD',
  NZ: 'NZD',
  OM: 'OMR',
  PA: 'PAB',
  PE: 'PEN',
  PF: 'XPF',
  PG: 'PGK',
  PH: 'PHP',
  PK: 'PKR',
  PL: 'PLN',
  PM: 'EUR',
  PN: 'NZD',
  PR: 'USD',
  PS: 'ILS',
  PT: 'EUR',
  PW: 'USD',
  PY: 'PYG',
  QA: 'QAR',
  RE: 'EUR',
  RO: 'RON',
  RS: 'RSD',
  RU: 'RUB',
  RW: 'RWF',
  SA: 'SAR',
  SB: 'SBD',
  SC: 'SCR',
  SD: 'SDG',
  SE: 'SEK',
  SG: 'SGD',
  SH: 'SHP',
  SI: 'EUR',
  SJ: 'NOK',
  SK: 'EUR',
  SL: 'SLL',
  SM: 'EUR',
  SN: 'XOF',
  SO: 'SOS',
  SR: 'SRD',
  SS: 'SSP',
  ST: 'STN',
  SV: 'USD',
  SX: 'ANG',
  SY: 'SYP',
  SZ: 'SZL',
  TC: 'USD',
  TD: 'XAF',
  TG: 'XOF',
  TH: 'THB',
  TJ: 'TJS',
  TK: 'NZD',
  TL: 'USD',
  TM: 'TMT',
  TN: 'TND',
  TO: 'TOP',
  TR: 'TRY',
  TT: 'TTD',
  TV: 'AUD',
  TW: 'TWD',
  TZ: 'TZS',
  UA: 'UAH',
  UG: 'UGX',
  UM: 'USD',
  US: 'USD',
  UY: 'UYU',
  UZ: 'UZS',
  VA: 'EUR',
  VC: 'XCD',
  VE: 'VES',
  VG: 'USD',
  VI: 'USD',
  VN: 'VND',
  VU: 'VUV',
  WF: 'XPF',
  WS: 'WST',
  XK: 'EUR',
  YE: 'YER',
  YT: 'EUR',
  ZA: 'ZAR',
  ZM: 'ZMW',
  ZW: 'USD',
};

const POPULAR_CURRENCY_CODES = [
  'USD',
  'EUR',
  'GBP',
  'JPY',
  'CNY',
  'INR',
  'AUD',
  'CAD',
  'CHF',
  'ZAR',
  'NGN',
  'KES',
  'BRL',
  'MXN',
  'AED',
];

const TIME_ZONE_TO_REGION: Record<string, string> = {
  'Africa/Cairo': 'EG',
  'Africa/Casablanca': 'MA',
  'Africa/Accra': 'GH',
  'Africa/Addis_Ababa': 'ET',
  'Africa/Algiers': 'DZ',
  'Africa/Gaborone': 'BW',
  'Africa/Johannesburg': 'ZA',
  'Africa/Khartoum': 'SD',
  'Africa/Kigali': 'RW',
  'Africa/Lagos': 'NG',
  'Africa/Maputo': 'MZ',
  'Africa/Maseru': 'LS',
  'Africa/Mbabane': 'SZ',
  'Africa/Nairobi': 'KE',
  'Africa/Windhoek': 'NA',
  'America/Anchorage': 'US',
  'America/Argentina/Buenos_Aires': 'AR',
  'America/Asuncion': 'PY',
  'America/Bogota': 'CO',
  'America/Caracas': 'VE',
  'America/Chicago': 'US',
  'America/Denver': 'US',
  'America/Guatemala': 'GT',
  'America/Los_Angeles': 'US',
  'America/Lima': 'PE',
  'America/Mexico_City': 'MX',
  'America/New_York': 'US',
  'America/Panama': 'PA',
  'America/Phoenix': 'US',
  'America/Puerto_Rico': 'PR',
  'America/Santiago': 'CL',
  'America/Sao_Paulo': 'BR',
  'America/St_Johns': 'CA',
  'America/Toronto': 'CA',
  'America/Vancouver': 'CA',
  'Asia/Almaty': 'KZ',
  'Asia/Bangkok': 'TH',
  'Asia/Dhaka': 'BD',
  'Asia/Dubai': 'AE',
  'Asia/Hong_Kong': 'HK',
  'Asia/Jakarta': 'ID',
  'Asia/Jerusalem': 'IL',
  'Asia/Kolkata': 'IN',
  'Asia/Kuala_Lumpur': 'MY',
  'Asia/Manila': 'PH',
  'Asia/Qatar': 'QA',
  'Asia/Riyadh': 'SA',
  'Asia/Seoul': 'KR',
  'Asia/Shanghai': 'CN',
  'Asia/Singapore': 'SG',
  'Asia/Tokyo': 'JP',
  'Asia/Taipei': 'TW',
  'Asia/Tbilisi': 'GE',
  'Asia/Tehran': 'IR',
  'Asia/Yerevan': 'AM',
  'Australia/Adelaide': 'AU',
  'Australia/Brisbane': 'AU',
  'Australia/Darwin': 'AU',
  'Australia/Hobart': 'AU',
  'Australia/Melbourne': 'AU',
  'Australia/Perth': 'AU',
  'Australia/Sydney': 'AU',
  'Europe/Amsterdam': 'NL',
  'Europe/Athens': 'GR',
  'Europe/Berlin': 'DE',
  'Europe/Brussels': 'BE',
  'Europe/Dublin': 'IE',
  'Europe/Helsinki': 'FI',
  'Europe/Istanbul': 'TR',
  'Europe/Kyiv': 'UA',
  'Europe/London': 'GB',
  'Europe/Madrid': 'ES',
  'Europe/Moscow': 'RU',
  'Europe/Oslo': 'NO',
  'Europe/Paris': 'FR',
  'Europe/Prague': 'CZ',
  'Europe/Rome': 'IT',
  'Europe/Stockholm': 'SE',
  'Europe/Warsaw': 'PL',
  'Europe/Zurich': 'CH',
  'Pacific/Auckland': 'NZ',
  'Pacific/Fiji': 'FJ',
  'Pacific/Honolulu': 'US',
};

function canConstructLocale(locale: string) {
  return typeof Intl !== 'undefined' && typeof Intl.Locale === 'function' && !!locale;
}

export function getDeviceLocale() {
  if (typeof navigator !== 'undefined') {
    const browserLocale = navigator.languages?.[0] ?? navigator.language;

    if (browserLocale) {
      return browserLocale;
    }
  }

  try {
    const runtimeLocale = Intl.DateTimeFormat().resolvedOptions().locale;

    if (runtimeLocale) {
      return runtimeLocale;
    }
  } catch {
    return FALLBACK_LOCALE;
  }

  return FALLBACK_LOCALE;
}

export function getDeviceTimeZone() {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone ?? null;
  } catch {
    return null;
  }
}

export function getRegionFromLocale(locale = getDeviceLocale()) {
  const normalizedLocale = locale.replace(/_/g, '-');

  if (canConstructLocale(normalizedLocale)) {
    try {
      return new Intl.Locale(normalizedLocale).maximize().region ?? null;
    } catch {
      // Fall back to string parsing below.
    }
  }

  const localeParts = normalizedLocale.split('-').filter(Boolean);
  const regionPart = localeParts.find((part, index) => index > 0 && /^[a-z]{2}$/i.test(part));

  return regionPart ? regionPart.toUpperCase() : null;
}

export function resolveCurrencyCodeFromRegion(region: string | null) {
  if (!region) {
    return null;
  }

  return REGION_TO_CURRENCY[region.toUpperCase()] ?? null;
}

export function resolveRegionFromTimeZone(timeZone: string | null) {
  if (!timeZone) {
    return null;
  }

  return TIME_ZONE_TO_REGION[timeZone] ?? null;
}

export function getDeviceCurrencyCode(locale = getDeviceLocale(), timeZone = getDeviceTimeZone()) {
  const timeZoneCurrencyCode = resolveCurrencyCodeFromRegion(resolveRegionFromTimeZone(timeZone));

  if (timeZoneCurrencyCode) {
    return timeZoneCurrencyCode;
  }

  return resolveCurrencyCodeFromRegion(getRegionFromLocale(locale));
}

export function isSupportedCurrencyCode(value: string) {
  const normalizedValue = value.trim().toUpperCase();

  if (!/^[A-Z]{3}$/.test(normalizedValue)) {
    return false;
  }

  try {
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: normalizedValue,
    }).format(0);

    return true;
  } catch {
    return false;
  }
}

export function normalizeCurrencyCode(value: string) {
  const normalizedValue = value.trim().toUpperCase();

  if (!isSupportedCurrencyCode(normalizedValue)) {
    throw new Error('Choose a valid 3-letter currency code, like USD, EUR, or ZAR.');
  }

  return normalizedValue;
}

export function coerceCurrencyCode(value: unknown, fallback = FALLBACK_CURRENCY_CODE) {
  const candidate = String(value ?? '').trim().toUpperCase();

  return isSupportedCurrencyCode(candidate) ? candidate : fallback;
}

export function getDefaultCurrencyCode(locale = getDeviceLocale(), timeZone = getDeviceTimeZone()) {
  return getDeviceCurrencyCode(locale, timeZone) ?? FALLBACK_CURRENCY_CODE;
}

export function getSuggestedCurrencyCodes(preferredCurrencyCode?: string | null) {
  const suggestedCodes = new Set<string>();
  const candidateCodes = [
    preferredCurrencyCode ? coerceCurrencyCode(preferredCurrencyCode, '') : '',
    getDeviceCurrencyCode() ?? '',
    ...POPULAR_CURRENCY_CODES,
  ];

  candidateCodes.forEach((currencyCode) => {
    if (currencyCode && isSupportedCurrencyCode(currencyCode)) {
      suggestedCodes.add(currencyCode);
    }
  });

  return Array.from(suggestedCodes);
}

export function normalizeCurrencyInput(value: string) {
  return value.replace(/[^a-z]/gi, '').toUpperCase().slice(0, 3);
}
