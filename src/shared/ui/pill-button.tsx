import React, { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Fonts, Radii, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type PillButtonProps = {
  label: string;
  active?: boolean;
  disabled?: boolean;
  leading?: ReactNode;
  onPress?: () => void;
};

export function PillButton({
  label,
  active = false,
  disabled = false,
  leading,
  onPress,
}: PillButtonProps) {
  const theme = useTheme();

  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.pressable,
        {
          opacity: disabled ? 0.5 : pressed ? 0.85 : 1,
        },
      ]}>
      <View
        style={[
          styles.container,
          {
            backgroundColor: active ? theme.primarySoft : theme.surface,
            borderColor: active ? theme.primary : theme.border,
          },
        ]}>
        {leading}
        <Text style={[styles.label, { color: active ? theme.primaryStrong : theme.text }]}>
          {label}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressable: {
    alignSelf: 'flex-start',
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
    borderWidth: 1,
    borderRadius: Radii.pill,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
  label: {
    fontFamily: Fonts.sans,
    fontSize: 13,
    fontWeight: '700',
  },
});
