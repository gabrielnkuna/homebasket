import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';

import { Fonts, Radii, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type ActionButtonProps = {
  label: string;
  onPress?: () => void;
  disabled?: boolean;
  tone?: 'primary' | 'secondary';
};

export function ActionButton({
  label,
  onPress,
  disabled = false,
  tone = 'primary',
}: ActionButtonProps) {
  const theme = useTheme();
  const backgroundColor = tone === 'primary' ? theme.primary : theme.surfaceMuted;
  const textColor = tone === 'primary' ? '#FFFFFF' : theme.text;

  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor,
          borderColor: tone === 'primary' ? theme.primaryStrong : theme.border,
          opacity: disabled ? 0.45 : pressed ? 0.85 : 1,
        },
      ]}>
      <Text style={[styles.label, { color: textColor }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 48,
    borderWidth: 1,
    borderRadius: Radii.pill,
    paddingHorizontal: Spacing.four,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontFamily: Fonts.sans,
    fontSize: 14,
    fontWeight: '800',
  },
});
