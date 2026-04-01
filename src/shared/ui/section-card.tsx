import React, { ReactNode } from 'react';
import { StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';

import { Fonts, Radii, Shadows, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type SectionCardProps = {
  title?: string;
  description?: string;
  tone?: 'default' | 'muted' | 'emphasis' | 'accent';
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
};

export function SectionCard({
  title,
  description,
  tone = 'default',
  children,
  style,
}: SectionCardProps) {
  const theme = useTheme();

  const backgroundColor = {
    default: theme.surface,
    muted: theme.surfaceMuted,
    emphasis: theme.primarySoft,
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
        style,
      ]}>
      {title ? (
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.text }]}>{title}</Text>
          {description ? (
            <Text style={[styles.description, { color: theme.textMuted }]}>{description}</Text>
          ) : null}
        </View>
      ) : null}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: Radii.large,
    padding: Spacing.five,
    gap: Spacing.four,
  },
  header: {
    gap: Spacing.one,
  },
  title: {
    fontFamily: Fonts.rounded,
    fontSize: 22,
    fontWeight: '800',
  },
  description: {
    fontFamily: Fonts.sans,
    fontSize: 14,
    lineHeight: 22,
  },
});
