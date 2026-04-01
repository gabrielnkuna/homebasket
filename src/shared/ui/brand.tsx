import { Image } from 'expo-image';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Fonts, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useTheme } from '@/hooks/use-theme';

const brandAssets = {
  heroLight: require('../../../assets/brand/homebasket_primary.png'),
  heroDark: require('../../../assets/brand/homebasket_reversed.png'),
  icon: require('../../../assets/brand/homebasket_appicon.png'),
};

type BrandHeroProps = {
  width?: number;
};

export function BrandHero({ width = 208 }: BrandHeroProps) {
  const scheme = useColorScheme();
  const source = scheme === 'dark' ? brandAssets.heroDark : brandAssets.heroLight;

  return (
    <Image
      source={source}
      contentFit="contain"
      style={{
        width,
        height: width * 0.72,
      }}
    />
  );
}

type BrandBadgeProps = {
  size?: number;
};

export function BrandBadge({ size = 56 }: BrandBadgeProps) {
  return (
    <Image
      source={brandAssets.icon}
      contentFit="contain"
      style={{
        width: size,
        height: size,
        borderRadius: Math.round(size * 0.22),
      }}
    />
  );
}

export function BrandNavLockup() {
  const theme = useTheme();

  return (
    <View style={styles.navLockup}>
      <BrandBadge size={42} />
      <View style={styles.navCopy}>
        <Text style={[styles.navTitle, { color: theme.text }]}>Home Basket</Text>
        <Text style={[styles.navSubtitle, { color: theme.textMuted }]}>
          Shared shopping for the whole household
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  navLockup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
  },
  navCopy: {
    gap: 2,
  },
  navTitle: {
    fontFamily: Fonts.rounded,
    fontSize: 18,
    fontWeight: '800',
  },
  navSubtitle: {
    fontFamily: Fonts.sans,
    fontSize: 12,
  },
});
