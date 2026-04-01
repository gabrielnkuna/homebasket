import '@/global.css';

import { DarkTheme, DefaultTheme, Theme } from '@react-navigation/native';
import { Platform, ViewStyle } from 'react-native';

export const Colors = {
  light: {
    text: '#173625',
    textMuted: '#5A665F',
    background: '#F5F0E8',
    surface: '#FFF9F1',
    surfaceMuted: '#EFE5D5',
    primary: '#1A4731',
    primaryStrong: '#143724',
    primarySoft: '#D9E8E0',
    accent: '#C9963A',
    accentSoft: '#F0DEB7',
    border: '#DDCFBC',
    success: '#2C6A48',
    danger: '#A34A37',
    tabBackground: '#FBF5EB',
  },
  dark: {
    text: '#F5F0E8',
    textMuted: '#BDC7BE',
    background: '#0F1713',
    surface: '#17211B',
    surfaceMuted: '#223029',
    primary: '#7DC39A',
    primaryStrong: '#A0DDB8',
    primarySoft: '#214A33',
    accent: '#D5A64B',
    accentSoft: '#584520',
    border: '#304037',
    success: '#7EC49C',
    danger: '#DD8C74',
    tabBackground: '#0F1713',
  },
} as const;

export type AppTheme = keyof typeof Colors;
export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = Platform.select({
  ios: {
    sans: 'Avenir Next',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'sans-serif',
    serif: 'serif',
    rounded: 'sans-serif-medium',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-sans)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const Spacing = {
  one: 4,
  two: 8,
  three: 12,
  four: 16,
  five: 24,
  six: 32,
  seven: 48,
} as const;

export const Radii = {
  small: 12,
  medium: 18,
  large: 28,
  pill: 999,
} as const;

export const Shadows = {
  card:
    (Platform.select<ViewStyle>({
      default: {
        shadowColor: '#1B2A1F',
        shadowOpacity: 0.08,
        shadowRadius: 18,
        shadowOffset: { width: 0, height: 10 },
        elevation: 4,
      },
    }) as ViewStyle) ?? {},
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80, default: 0 }) ?? 0;
export const MaxContentWidth = 1120;

export function createNavigationTheme(mode: AppTheme): Theme {
  const palette = Colors[mode];
  const base = mode === 'dark' ? DarkTheme : DefaultTheme;

  return {
    ...base,
    colors: {
      ...base.colors,
      primary: palette.primary,
      background: palette.background,
      card: palette.surface,
      text: palette.text,
      border: palette.border,
      notification: palette.accent,
    },
  };
}
