import React from 'react';
import { StyleSheet, View } from 'react-native';

import { Radii, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

import { getBannerAdUnitId, supportsMobileAdsOnThisDevice } from './admob-config';
import { initializeAdsAsync } from './ads-service';

export function MobileBannerAd() {
  const theme = useTheme();
  const adUnitId = React.useMemo(() => getBannerAdUnitId(), []);
  const [bannerModule, setBannerModule] =
    React.useState<null | typeof import('react-native-google-mobile-ads')>(null);
  const [isReady, setIsReady] = React.useState(false);
  const [hasLoadError, setHasLoadError] = React.useState(false);

  React.useEffect(() => {
    let isMounted = true;

    if (!supportsMobileAdsOnThisDevice() || !adUnitId) {
      return () => {
        isMounted = false;
      };
    }

    void Promise.all([
      initializeAdsAsync(),
      import('react-native-google-mobile-ads'),
    ]).then(([state, module]) => {
      if (isMounted) {
        setIsReady(state.available);
        setBannerModule(module);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [adUnitId]);

  if (!supportsMobileAdsOnThisDevice() || !adUnitId || !isReady || hasLoadError || !bannerModule) {
    return null;
  }

  const BannerAdComponent = bannerModule.BannerAd;
  const bannerSize = bannerModule.BannerAdSize.ANCHORED_ADAPTIVE_BANNER;

  return (
    <View
      style={[
        styles.bannerCard,
        {
          backgroundColor: theme.surface,
          borderColor: theme.border,
        },
      ]}>
      <BannerAdComponent
        unitId={adUnitId}
        size={bannerSize}
        onAdFailedToLoad={() => setHasLoadError(true)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  bannerCard: {
    alignSelf: 'stretch',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: Radii.medium,
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.two,
  },
});
