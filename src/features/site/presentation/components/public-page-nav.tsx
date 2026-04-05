import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Fonts, Radii, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { HOME_BASKET_ROUTES } from '@/shared/config/app-links';

type PublicPageNavProps = {
  active: 'privacy' | 'terms' | 'android' | 'ios';
};

export function PublicPageNav({ active }: PublicPageNavProps) {
  const openPath = React.useCallback((path: string) => {
    globalThis.location.assign(path);
  }, []);

  return (
    <View style={styles.row}>
      <NavChip
        label="Home"
        active={false}
        onPress={() => openPath('/')}
      />
      <NavChip
        label="Privacy"
        active={active === 'privacy'}
        onPress={() => openPath(HOME_BASKET_ROUTES.privacy)}
      />
      <NavChip
        label="Terms"
        active={active === 'terms'}
        onPress={() => openPath(HOME_BASKET_ROUTES.terms)}
      />
      <NavChip
        label="Android app"
        active={active === 'android'}
        onPress={() => openPath(HOME_BASKET_ROUTES.android)}
      />
      <NavChip
        label="iPhone app"
        active={active === 'ios'}
        onPress={() => openPath(HOME_BASKET_ROUTES.ios)}
      />
    </View>
  );
}

function NavChip({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  const theme = useTheme();

  return (
    <Pressable
      accessibilityRole="link"
      onPress={onPress}
      style={[
        styles.chip,
        {
          backgroundColor: active ? theme.primarySoft : theme.surface,
          borderColor: active ? theme.primary : theme.border,
        },
      ]}>
      <Text style={[styles.chipText, { color: active ? theme.primaryStrong : theme.text }]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  chip: {
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderRadius: Radii.pill,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
  chipText: {
    fontFamily: Fonts.sans,
    fontSize: 13,
    fontWeight: '700',
  },
});
