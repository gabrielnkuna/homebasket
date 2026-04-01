import { ThemeProvider } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';
import { Text } from 'react-native';

import AppTabs from '@/components/app-tabs';
import { createNavigationTheme } from '@/constants/theme';
import OnboardingScreen from '@/features/home-basket/presentation/screens/onboarding-screen';
import { useHomeBasketStore } from '@/features/home-basket/presentation/use-home-basket-store';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { BrandHero, ScreenShell, SectionCard } from '@/shared/ui';
import { useTheme } from '@/hooks/use-theme';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const initialize = useHomeBasketStore((state) => state.initialize);
  const session = useHomeBasketStore((state) => state.session);
  const isReady = useHomeBasketStore((state) => state.isReady);
  const isBootstrapping = useHomeBasketStore((state) => state.isBootstrapping);
  const themeMode = colorScheme === 'dark' ? 'dark' : 'light';

  useEffect(() => {
    void initialize();
  }, [initialize]);

  return (
    <ThemeProvider value={createNavigationTheme(themeMode)}>
      <StatusBar style={themeMode === 'dark' ? 'light' : 'dark'} />
      {!isReady || isBootstrapping ? (
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
