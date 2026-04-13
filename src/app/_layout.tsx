import { ThemeProvider } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { usePathname } from 'expo-router';
import Head from 'expo-router/head';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import AppTabs from '@/components/app-tabs';
import { Colors, createNavigationTheme } from '@/constants/theme';
import OnboardingScreen from '@/features/home-basket/presentation/screens/onboarding-screen';
import { useHomeBasketStore } from '@/features/home-basket/presentation/use-home-basket-store';
import { useColorScheme } from '@/hooks/use-color-scheme';
import PrivacyScreen from '@/features/site/presentation/screens/privacy-screen';
import TermsScreen from '@/features/site/presentation/screens/terms-screen';
import AndroidDownloadScreen from '@/features/site/presentation/screens/android-download-screen';
import IosDownloadScreen from '@/features/site/presentation/screens/ios-download-screen';
import SupportScreen from '@/features/site/presentation/screens/support-screen';
import DeleteAccountScreen from '@/features/site/presentation/screens/delete-account-screen';
import AboutScreen from '@/features/site/presentation/screens/about-screen';
import { BrandHero, ScreenShell, SectionCard } from '@/shared/ui';
import { useTheme } from '@/hooks/use-theme';
import { HOME_BASKET_ROUTES } from '@/shared/config/app-links';
import { initializeAdsAsync } from '@/shared/ads';
import { syncPendingItemsBadgeCountAsync } from '@/shared/notifications';

const seoByPath: Record<string, { title: string; description: string }> = {
  '/': {
    title: 'Home Basket - Shared shopping list for the whole household',
    description:
      'Home Basket is a shared household shopping list with purchases, receipt proof, reminders, and payday-based monthly budgets.',
  },
  [HOME_BASKET_ROUTES.about]: {
    title: 'About Home Basket - Shared household shopping list app',
    description:
      'Learn how Home Basket helps households coordinate shopping lists, purchases, receipts, reminders, and monthly budget cycles.',
  },
  [HOME_BASKET_ROUTES.privacy]: {
    title: 'Privacy Policy - Home Basket',
    description:
      'How Home Basket handles household data, accounts, receipts, shared shopping records, and mobile ads.',
  },
  [HOME_BASKET_ROUTES.terms]: {
    title: 'Terms of Use - Home Basket',
    description: 'Terms of use for Home Basket on web, Android, and iPhone.',
  },
  [HOME_BASKET_ROUTES.support]: {
    title: 'Support - Home Basket',
    description: 'Contact Home Basket support for account, setup, restore, and app help.',
  },
  [HOME_BASKET_ROUTES.deleteAccount]: {
    title: 'Delete Account - Home Basket',
    description: 'How to request account and data deletion for Home Basket.',
  },
  [HOME_BASKET_ROUTES.android]: {
    title: 'Home Basket for Android',
    description: 'Download information for the Home Basket Android app.',
  },
  [HOME_BASKET_ROUTES.ios]: {
    title: 'Home Basket for iPhone',
    description: 'Download information for the Home Basket iPhone app.',
  },
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const pathname = usePathname();
  const initialize = useHomeBasketStore((state) => state.initialize);
  const session = useHomeBasketStore((state) => state.session);
  const snapshot = useHomeBasketStore((state) => state.snapshot);
  const isReady = useHomeBasketStore((state) => state.isReady);
  const isBootstrapping = useHomeBasketStore((state) => state.isBootstrapping);
  const themeMode = colorScheme === 'dark' ? 'dark' : 'light';
  const pendingItemsCount =
    session && snapshot ? snapshot.items.filter((item) => item.status === 'pending').length : 0;
  const isPublicInfoRoute =
    pathname === HOME_BASKET_ROUTES.about ||
    pathname === HOME_BASKET_ROUTES.privacy ||
    pathname === HOME_BASKET_ROUTES.terms ||
    pathname === HOME_BASKET_ROUTES.support ||
    pathname === HOME_BASKET_ROUTES.deleteAccount ||
    pathname === HOME_BASKET_ROUTES.android ||
    pathname === HOME_BASKET_ROUTES.ios;
  const seo = seoByPath[pathname] ?? seoByPath['/'];
  const canonicalUrl = `https://homebasketapp.com${pathname === '/' ? '' : pathname}`;

  useEffect(() => {
    if (isPublicInfoRoute) {
      return;
    }

    void initialize();
  }, [initialize, isPublicInfoRoute]);

  useEffect(() => {
    if (typeof document === 'undefined') {
      return;
    }

    const palette = Colors[themeMode];
    document.documentElement.style.backgroundColor = palette.background;
    document.documentElement.style.colorScheme = themeMode;
    document.body.style.backgroundColor = palette.background;
  }, [themeMode]);

  useEffect(() => {
    if (isPublicInfoRoute) {
      return;
    }

    void initializeAdsAsync();
  }, [isPublicInfoRoute]);

  useEffect(() => {
    if (isPublicInfoRoute || !isReady || isBootstrapping) {
      return;
    }

    void syncPendingItemsBadgeCountAsync(pendingItemsCount);
  }, [isBootstrapping, isPublicInfoRoute, isReady, pendingItemsCount]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider value={createNavigationTheme(themeMode)}>
        <Head>
          <title>{seo.title}</title>
          <meta name="description" content={seo.description} />
          <meta property="og:title" content={seo.title} />
          <meta property="og:description" content={seo.description} />
          <meta property="og:type" content="website" />
          <meta property="og:url" content={canonicalUrl} />
          <meta name="twitter:card" content="summary" />
          <link rel="canonical" href={canonicalUrl} />
        </Head>
        <StatusBar style={themeMode === 'dark' ? 'light' : 'dark'} />
        {pathname === HOME_BASKET_ROUTES.about ? (
          <AboutScreen />
        ) : pathname === HOME_BASKET_ROUTES.privacy ? (
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
    </GestureHandlerRootView>
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
        <View style={styles.loadingRow}>
          <ActivityIndicator
            accessibilityLabel="Loading Home Basket"
            color={theme.primary}
            size="small"
          />
          <Text style={[styles.loadingText, { color: theme.textMuted }]}>
            Preparing the shopping list, purchase history, and household members.
          </Text>
        </View>
      </SectionCard>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    flex: 1,
    fontSize: 15,
    lineHeight: 22,
  },
});
