import Constants from 'expo-constants';
import { Platform } from 'react-native';

const SAMPLE_BANNER_AD_UNIT_ID = 'ca-app-pub-3940256099942544/9214589741';
const SAMPLE_INTERSTITIAL_AD_UNIT_ID = 'ca-app-pub-3940256099942544/1033173712';

function getAppOwnership() {
  return (Constants as { appOwnership?: string | null }).appOwnership ?? null;
}

function isExpoGo() {
  return getAppOwnership() === 'expo';
}

function resolvePlatformValue(androidValue?: string, iosValue?: string) {
  return Platform.select({
    android: androidValue,
    ios: iosValue,
    default: undefined,
  });
}

export function areMobileAdsEnabled() {
  return process.env.EXPO_PUBLIC_ADS_ENABLED !== 'false';
}

export function shouldUseTestAdUnits() {
  return process.env.EXPO_PUBLIC_ADMOB_USE_TEST_IDS === 'true';
}

export function supportsMobileAdsOnThisDevice() {
  return areMobileAdsEnabled() && Platform.OS !== 'web' && !isExpoGo();
}

export function getBannerAdUnitId() {
  const configuredId = resolvePlatformValue(
    process.env.EXPO_PUBLIC_ADMOB_ANDROID_BANNER_ID,
    process.env.EXPO_PUBLIC_ADMOB_IOS_BANNER_ID
  );

  if (configuredId) {
    return configuredId;
  }

  return shouldUseTestAdUnits() ? SAMPLE_BANNER_AD_UNIT_ID : null;
}

export function getInterstitialAdUnitId() {
  const configuredId = resolvePlatformValue(
    process.env.EXPO_PUBLIC_ADMOB_ANDROID_INTERSTITIAL_ID,
    process.env.EXPO_PUBLIC_ADMOB_IOS_INTERSTITIAL_ID
  );

  if (configuredId) {
    return configuredId;
  }

  return shouldUseTestAdUnits() ? SAMPLE_INTERSTITIAL_AD_UNIT_ID : null;
}
