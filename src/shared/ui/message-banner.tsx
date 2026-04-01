import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Fonts, Radii, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type MessageBannerProps = {
  message: string;
  tone?: 'notice' | 'error';
};

export function MessageBanner({ message, tone = 'notice' }: MessageBannerProps) {
  const theme = useTheme();
  const backgroundColor = tone === 'error' ? theme.surfaceMuted : theme.accentSoft;
  const borderColor = tone === 'error' ? theme.danger : theme.border;
  const textColor = tone === 'error' ? theme.danger : theme.text;

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor,
          borderColor,
        },
      ]}>
      <Text style={[styles.message, { color: textColor }]}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderRadius: Radii.medium,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
  },
  message: {
    fontFamily: Fonts.sans,
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 22,
  },
});
