import { ThemeProvider } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';
import { Text } from 'react-native';
import { usePathname } from 'expo-router';

import AppTabs from '@/components/app-tabs';
import { createNavigationTheme } from '@/constants/theme';
import OnboardingScreen from '@/features/home-basket/presentation/screens/onboarding-screen';
import { useHomeBasketStore } from '@/features/home-basket/presentation/use-home-basket-store';
import { useColorScheme } from '@/hooks/use-color-scheme';
import PrivacyScreen from '@/features/site/presentation/screens/privacy-screen';
import TermsScreen from '@/features/site/presentation/screens/terms-screen';
import AndroidDownloadScreen from '@/features/site/presentation/screens/android-download-screen';
import IosDownloadScreen from '@/features/site/presentation/screens/ios-download-screen';
import SupportScreen from '@/features/site/presentation/screens/support-screen';
import DeleteAccountScreen from '@/features/site/presentation/screens/delete-account-screen';
import { BrandHero, ScreenShell, SectionCard } from '@/shared/ui';
import { useTheme } from '@/hooks/use-theme';
import { HOME_BASKET_ROUTES } from '@/shared/config/app-links';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const pathname = usePathname();
  const initialize = useHomeBasketStore((state) => state.initialize);
  const session = useHomeBasketStore((state) => state.session);
  const isReady = useHomeBasketStore((state) => state.isReady);
  const isBootstrapping = useHomeBasketStore((state) => state.isBootstrapping);
  const themeMode = colorScheme === 'dark' ? 'dark' : 'light';
  const isPublicInfoRoute =
    pathname === HOME_BASKET_ROUTES.privacy ||
    pathname === HOME_BASKET_ROUTES.terms ||
    pathname === HOME_BASKET_ROUTES.support ||
    pathname === HOME_BASKET_ROUTES.deleteAccount ||
    pathname === HOME_BASKET_ROUTES.android ||
    pathname === HOME_BASKET_ROUTES.ios;

  useEffect(() => {
    if (isPublicInfoRoute) {
      return;
    }

    void initialize();
  }, [initialize, isPublicInfoRoute]);

  return (
    <ThemeProvider value={createNavigationTheme(themeMode)}>
      <StatusBar style={themeMode === 'dark' ? 'light' : 'dark'} />
      {pathname === HOME_BASKET_ROUTES.privacy ? (
        <PrivacyScreen />
      ) : pathname === HOME_BASKET_ROUTES.terms ? (
        <TermsScreen />
      ) : pathname === HOME_BASKET_ROUTES.support ? (
        <SupportScreen />
      ) : pathname === HOME_BASKET_ROUTES.deleteAccount ? (
        <DeleteAccountScreen />
      ) : pathname === HOME_BASKET_ROUTES.android ? (
        <AndroidDownloadScreen />
      ) : pathname === HOME_BASKET_ROUTES.ios ? (
        <IosDownloadScreen />
      ) : !isReady || isBootstrapping ? (
        <BootstrapScreen />
      ) : session ? (
        <AppTabs />
      ) : (
        <OnboardingScreen />
      )}
    </ThemeProvider>
  );
}

function BootstrapScreen() {
  const theme = useTheme();

  return (
    <ScreenShell
      eyebrow="Home Basket"
      title="Restoring this device"
      headerArt={<BrandHero width={180} />}
      subtitle="Checking the device identity, restoring the linked household session, and reconnecting to the shared basket.">
      <SectionCard tone="muted">
        <Text style={{ color: theme.textMuted }}>
          Preparing the shopping list, purchase history, and household members.
        </Text>
      </SectionCard>
    </ScreenShell>
  );
}
