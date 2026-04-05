import type { AdsRuntimeState } from './ads-types';

const disabledAdsState: AdsRuntimeState = {
  enabled: false,
  initialized: false,
  available: false,
  privacyOptionsRequired: false,
};

export async function initializeAdsAsync(): Promise<AdsRuntimeState> {
  return disabledAdsState;
}

export async function openAdsPrivacyOptions() {
  return false;
}

export function supportsAdsPrivacyOptions() {
  return false;
}

export async function showInterstitialAdIfReady() {
  return false;
}
