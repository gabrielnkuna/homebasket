import React from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';

import { Fonts, Radii, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { normalizeCurrencyInput } from '@/shared/locale/currency-preferences';
import { PillButton } from './pill-button';

type CurrencySelectorProps = {
  value: string;
  suggestions: string[];
  helperText?: string;
  editable?: boolean;
  onChange: (currencyCode: string) => void;
};

export function CurrencySelector({
  value,
  suggestions,
  helperText,
  editable = true,
  onChange,
}: CurrencySelectorProps) {
  const theme = useTheme();
  const normalizedValue = normalizeCurrencyInput(value);

  return (
    <View style={styles.container}>
      <Text style={[styles.fieldLabel, { color: theme.textMuted }]}>Currency</Text>
      <View style={styles.rowWrap}>
        {suggestions.map((currencyCode) => (
          <PillButton
            key={currencyCode}
            label={currencyCode}
            active={normalizedValue === currencyCode}
            disabled={!editable}
            onPress={() => onChange(currencyCode)}
          />
        ))}
      </View>
      <TextInput
        autoCapitalize="characters"
        autoCorrect={false}
        editable={editable}
        maxLength={3}
        value={normalizedValue}
        onChangeText={(nextValue) => onChange(normalizeCurrencyInput(nextValue))}
        placeholder="USD"
        placeholderTextColor={theme.textMuted}
        style={[
          styles.input,
          {
            backgroundColor: theme.surface,
            borderColor: theme.border,
            color: theme.text,
            opacity: editable ? 1 : 0.7,
          },
        ]}
      />
      {helperText ? <Text style={[styles.helperText, { color: theme.textMuted }]}>{helperText}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.two,
  },
  rowWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  fieldLabel: {
    fontFamily: Fonts.sans,
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  input: {
    minHeight: 52,
    borderWidth: 1,
    borderRadius: Radii.medium,
    paddingHorizontal: Spacing.three,
    fontFamily: Fonts.sans,
    fontSize: 16,
  },
  helperText: {
    fontFamily: Fonts.sans,
    fontSize: 14,
    lineHeight: 22,
  },
});
