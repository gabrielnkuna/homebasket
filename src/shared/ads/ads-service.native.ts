import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform, StatusBar } from 'react-native';

import {
  getAdsLaunchThreshold,
  getInterstitialAdUnitId,
  supportsMobileAdsOnThisDevice,
} from './admob-config';
import type { AdsRuntimeState } from './ads-types';

const ADS_LAUNCH_COUNT_STORAGE_KEY = 'home-basket:ads-launch-count';

let adsState: AdsRuntimeState = {
  enabled: supportsMobileAdsOnThisDevice(),
  initialized: false,
  available: false,
  privacyOptionsRequired: false,
};

let initializePromise: Promise<AdsRuntimeState> | null = null;
let googleMobileAdsModulePromise: Promise<typeof import('react-native-google-mobile-ads')> | null =
  null;
let interstitial: any | null = null;
let interstitialLoaded = false;
let interstitialLoading = false;
let lastInterstitialAt = 0;
let launchCountForSession: number | null = null;

async function getRecordedLaunchCount() {
  if (launchCountForSession !== null) {
    return launchCountForSession;
  }

  const rawValue = await AsyncStorage.getItem(ADS_LAUNCH_COUNT_STORAGE_KEY);
  const parsedValue = rawValue ? Number.parseInt(rawValue, 10) : 0;

  launchCountForSession = Number.isFinite(parsedValue) && parsedValue > 0 ? parsedValue : 0;
  return launchCountForSession;
}

async function recordAppLaunchForAds() {
  const currentCount = await getRecordedLaunchCount();
  const nextCount = currentCount + 1;

  launchCountForSession = nextCount;
  await AsyncStorage.setItem(ADS_LAUNCH_COUNT_STORAGE_KEY, String(nextCount));

  return nextCount;
}

function loadGoogleMobileAdsModule() {
  if (!googleMobileAdsModulePromise) {
    googleMobileAdsModulePromise = import('react-native-google-mobile-ads');
  }

  return googleMobileAdsModulePromise;
}

function setPrivacyRequirement(status: string) {
  adsState = {
    ...adsState,
    privacyOptionsRequired: status === 'REQUIRED',
  };
}

async function ensureInterstitial() {
  const adUnitId = getInterstitialAdUnitId();

  if (!supportsMobileAdsOnThisDevice() || !adUnitId || interstitial) {
    return;
  }

  const googleMobileAds = await loadGoogleMobileAdsModule();
  const nextInterstitial = googleMobileAds.InterstitialAd.createForAdRequest(adUnitId);
  interstitial = nextInterstitial;

  nextInterstitial.addAdEventListener(googleMobileAds.AdEventType.LOADED, () => {
    interstitialLoaded = true;
    interstitialLoading = false;
  });

  nextInterstitial.addAdEventListener(googleMobileAds.AdEventType.ERROR, () => {
    interstitialLoaded = false;
    interstitialLoading = false;
  });

  nextInterstitial.addAdEventListener(googleMobileAds.AdEventType.OPENED, () => {
    if (Platform.OS === 'ios') {
      StatusBar.setHidden(true);
    }
  });

  nextInterstitial.addAdEventListener(googleMobileAds.AdEventType.CLOSED, () => {
    if (Platform.OS === 'ios') {
      StatusBar.setHidden(false);
    }

    interstitialLoaded = false;
    interstitialLoading = false;
    void loadInterstitial();
  });
}

async function loadInterstitial() {
  await ensureInterstitial();

  if (!interstitial || interstitialLoaded || interstitialLoading) {
    return;
  }

  interstitialLoading = true;
  interstitial.load();
}

export async function initializeAdsAsync(): Promise<AdsRuntimeState> {
  if (!supportsMobileAdsOnThisDevice()) {
    adsState = {
      enabled: false,
      initialized: true,
      available: false,
      privacyOptionsRequired: false,
    };
    return adsState;
  }

  if (adsState.initialized) {
    return adsState;
  }

  if (initializePromise) {
    return initializePromise;
  }

  initializePromise = (async () => {
    try {
      const launchCount = await recordAppLaunchForAds();
      const launchThreshold = getAdsLaunchThreshold();

      adsState = {
        enabled: true,
        initialized: launchCount < launchThreshold,
        available: false,
        privacyOptionsRequired: false,
      };

      if (launchCount < launchThreshold) {
        return adsState;
      }

      const googleMobileAds = await loadGoogleMobileAdsModule();
      const consentInfo = await googleMobileAds.AdsConsent.gatherConsent();
      setPrivacyRequirement(consentInfo.privacyOptionsRequirementStatus);

      if (!consentInfo.canRequestAds) {
        adsState = {
          ...adsState,
          initialized: true,
          available: false,
        };

        return adsState;
      }

      await googleMobileAds.default().setRequestConfiguration({
        maxAdContentRating: googleMobileAds.MaxAdContentRating.PG,
        tagForChildDirectedTreatment: false,
        tagForUnderAgeOfConsent: false,
      });

      await googleMobileAds.default().initialize();
      adsState = {
        ...adsState,
        initialized: true,
        available: true,
      };
      await loadInterstitial();

      return adsState;
    } catch (error) {
      if (__DEV__) {
        console.warn('Home Basket ads failed to initialize.', error);
      }

      adsState = {
        ...adsState,
        initialized: true,
        available: false,
      };

      return adsState;
    } finally {
      initializePromise = null;
    }
  })();

  return initializePromise;
}

export async function openAdsPrivacyOptions() {
  if (!supportsMobileAdsOnThisDevice()) {
    return false;
  }

  try {
    const googleMobileAds = await loadGoogleMobileAdsModule();
    const consentInfo = await googleMobileAds.AdsConsent.showPrivacyOptionsForm();
    setPrivacyRequirement(consentInfo.privacyOptionsRequirementStatus);

    if (consentInfo.canRequestAds && !adsState.available) {
      await initializeAdsAsync();
    }

    return true;
  } catch (error) {
    if (__DEV__) {
      console.warn('Home Basket could not open ad privacy options.', error);
    }

    return false;
  }
}

export function supportsAdsPrivacyOptions() {
  return supportsMobileAdsOnThisDevice();
}

export async function showInterstitialAdIfReady(minIntervalMs = 4 * 60 * 1000) {
  const state = await initializeAdsAsync();

  if (!state.available) {
    return false;
  }

  await loadInterstitial();

  if (!interstitial || !interstitialLoaded) {
    return false;
  }

  const now = Date.now();

  if (now - lastInterstitialAt < minIntervalMs) {
    return false;
  }

  try {
    lastInterstitialAt = now;
    interstitialLoaded = false;
    interstitial.show();
    return true;
  } catch (error) {
    if (__DEV__) {
      console.warn('Home Basket could not show an interstitial ad.', error);
    }

    return false;
  }
}
