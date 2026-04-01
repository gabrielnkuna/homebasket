import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Fonts, Radii, Shadows, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type MetricCardProps = {
  label: string;
  value: string;
  helper?: string;
  tone?: 'default' | 'primary' | 'accent';
};

export function MetricCard({
  label,
  value,
  helper,
  tone = 'default',
}: MetricCardProps) {
  const theme = useTheme();

  const backgroundColor = {
    default: theme.surface,
    primary: theme.primarySoft,
    accent: theme.accentSoft,
  }[tone];

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor,
          borderColor: theme.border,
        },
        Shadows.card,
      ]}>
      <Text style={[styles.label, { color: theme.textMuted }]}>{label}</Text>
      <Text style={[styles.value, { color: theme.text }]}>{value}</Text>
      {helper ? <Text style={[styles.helper, { color: theme.textMuted }]}>{helper}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexBasis: 220,
    flexGrow: 1,
    borderWidth: 1,
    borderRadius: Radii.medium,
    padding: Spacing.four,
    gap: Spacing.one,
  },
  label: {
    fontFamily: Fonts.sans,
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  value: {
    fontFamily: Fonts.rounded,
    fontSize: 30,
    lineHeight: 34,
    fontWeight: '800',
  },
  helper: {
    fontFamily: Fonts.sans,
    fontSize: 13,
  },
});
