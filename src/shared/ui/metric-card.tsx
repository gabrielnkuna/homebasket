import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Fonts, Radii, Shadows, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type MetricCardProps = {
  label: string;
  value: string;
  helper?: string;
  tone?: 'default' | 'primary' | 'accent';
  accessibilityHint?: string;
  onPress?: () => void;
};

export function MetricCard({
  label,
  value,
  helper,
  tone = 'default',
  accessibilityHint,
  onPress,
}: MetricCardProps) {
  const theme = useTheme();

  const backgroundColor = {
    default: theme.surface,
    primary: theme.primarySoft,
    accent: theme.accentSoft,
  }[tone];

  const cardContent = (
    <>
      <Text style={[styles.label, { color: theme.textMuted }]}>{label}</Text>
      <Text style={[styles.value, { color: theme.text }]}>{value}</Text>
      {helper ? <Text style={[styles.helper, { color: theme.textMuted }]}>{helper}</Text> : null}
    </>
  );

  const cardStyle = [
    styles.card,
    {
      backgroundColor,
      borderColor: theme.border,
    },
    Shadows.card,
  ];

  if (onPress) {
    return (
      <Pressable
        accessibilityRole="button"
        accessibilityHint={accessibilityHint}
        onPress={onPress}
        style={({ pressed }) => [
          cardStyle,
          {
            opacity: pressed ? 0.86 : 1,
          },
        ]}>
        {cardContent}
      </Pressable>
    );
  }

  return (
    <View
      style={cardStyle}>
      {cardContent}
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
