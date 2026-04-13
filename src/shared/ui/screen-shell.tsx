import React, { ReactNode } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleProp,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Fonts, MaxContentWidth, Radii, Shadows, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { MobileBannerAd } from '@/shared/ads';
import { WebFooter } from './web-footer';

type ScreenShellProps = {
  title: string;
  eyebrow?: string;
  subtitle?: string;
  badge?: string;
  children: ReactNode;
  headerArt?: ReactNode;
  headerAccessory?: ReactNode;
  contentStyle?: StyleProp<ViewStyle>;
  swipeNavigationEnabled?: boolean;
  scrollToTopSignal?: string | number | null;
  floatingAction?: {
    accessibilityLabel: string;
    accessibilityHint?: string;
    label?: string;
    disabled?: boolean;
    onPress: () => void;
    scrollTo?: 'top' | 'bottom';
  };
  scrollToBottomSignal?: string | number | null;
};

export function ScreenShell({
  title,
  eyebrow,
  subtitle,
  badge,
  children,
  headerArt,
  headerAccessory,
  contentStyle,
  swipeNavigationEnabled = false,
  scrollToTopSignal = null,
  floatingAction,
  scrollToBottomSignal = null,
}: ScreenShellProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const scrollRef = React.useRef<ScrollView | null>(null);
  const hasFloatingAd = swipeNavigationEnabled && Platform.OS !== 'web';
  const hasFloatingAction = Boolean(floatingAction);

  const topPadding = Platform.select({
    web: Spacing.seven,
    default: insets.top + Spacing.five,
  });

  const bottomPadding = Platform.select({
    web: Spacing.seven + (hasFloatingAction ? 88 : 0),
    default:
      insets.bottom +
      Spacing.six +
      Spacing.seven +
      (hasFloatingAd ? 96 : 0) +
      (hasFloatingAction ? 88 : 0),
  });

  const keyboardAvoidingBehavior = Platform.select({
    ios: 'padding' as const,
    android: 'height' as const,
    default: undefined,
  });

  React.useEffect(() => {
    if (!scrollToTopSignal) {
      return;
    }

    const frame = requestAnimationFrame(() => {
      scrollRef.current?.scrollTo({ y: 0, animated: true });
    });

    return () => cancelAnimationFrame(frame);
  }, [scrollToTopSignal]);

  React.useEffect(() => {
    if (!scrollToBottomSignal) {
      return;
    }

    const frame = requestAnimationFrame(() => {
      scrollRef.current?.scrollToEnd({ animated: true });
    });

    return () => cancelAnimationFrame(frame);
  }, [scrollToBottomSignal]);

  const handleFloatingActionPress = React.useCallback(() => {
    if (!floatingAction || floatingAction.disabled) {
      return;
    }

    if (floatingAction.scrollTo === 'top') {
      scrollRef.current?.scrollTo({ y: 0, animated: true });
    }

    if (floatingAction.scrollTo === 'bottom') {
      scrollRef.current?.scrollToEnd({ animated: true });
    }

    if (floatingAction.scrollTo) {
      setTimeout(floatingAction.onPress, Platform.OS === 'web' ? 80 : 240);
      return;
    }

    floatingAction.onPress();
  }, [floatingAction]);

  const content = (
    <ScrollView
      ref={scrollRef}
      style={styles.scroll}
      keyboardShouldPersistTaps="always"
      keyboardDismissMode="none"
      automaticallyAdjustKeyboardInsets={Platform.OS === 'ios'}
      contentContainerStyle={[
        styles.scrollContent,
        {
          paddingTop: topPadding,
          paddingBottom: bottomPadding,
          paddingLeft: Spacing.four,
          paddingRight: Spacing.four,
        },
      ]}>
      <View style={[styles.frame, contentStyle]}>
        <View
          style={[
            styles.headerCard,
            {
              backgroundColor: theme.surface,
              borderColor: theme.border,
            },
            Shadows.card,
          ]}>
          <View style={styles.headerContent}>
            <View style={styles.headingStack}>
              {headerArt ? <View style={styles.headerArt}>{headerArt}</View> : null}
              {eyebrow ? <Text style={[styles.eyebrow, { color: theme.primary }]}>{eyebrow}</Text> : null}
              <Text style={[styles.title, { color: theme.text }]}>{title}</Text>
              {subtitle ? <Text style={[styles.subtitle, { color: theme.textMuted }]}>{subtitle}</Text> : null}
            </View>

            <View style={styles.headerMeta}>
              {badge ? (
                <View
                  style={[
                    styles.badge,
                    {
                      backgroundColor: theme.primarySoft,
                      borderColor: theme.border,
                    },
                  ]}>
                  <Text style={[styles.badgeText, { color: theme.primaryStrong }]}>{badge}</Text>
                </View>
              ) : null}
              {headerAccessory ? <View style={styles.headerAccessory}>{headerAccessory}</View> : null}
            </View>
          </View>
        </View>

        <View style={styles.sectionStack}>{children}</View>
        <WebFooter />
      </View>
    </ScrollView>
  );

  return (
    <KeyboardAvoidingView
      style={[styles.keyboardRoot, { backgroundColor: theme.background }]}
      behavior={keyboardAvoidingBehavior}>
      {content}
      {hasFloatingAd ? (
        <View
          pointerEvents="box-none"
          style={[
            styles.floatingAdDock,
            {
              bottom: insets.bottom + Spacing.two,
            },
          ]}>
          <MobileBannerAd />
        </View>
      ) : null}
      {floatingAction ? (
        <View
          pointerEvents="box-none"
          style={[
            styles.floatingActionDock,
            {
              bottom:
                Platform.OS === 'web'
                  ? Spacing.four
                  : insets.bottom + Spacing.four + (hasFloatingAd ? 96 : 0),
            },
          ]}>
          <View style={styles.floatingActionFrame}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={floatingAction.accessibilityLabel}
              accessibilityHint={floatingAction.accessibilityHint}
              disabled={floatingAction.disabled}
              focusable={Platform.OS !== 'android'}
              onPress={handleFloatingActionPress}
              style={({ pressed }) => [
                styles.floatingActionButton,
                floatingAction.label ? styles.floatingActionButtonExtended : null,
                Shadows.card,
                {
                  backgroundColor: theme.primary,
                  borderColor: theme.primaryStrong,
                  opacity: floatingAction.disabled ? 0.45 : pressed ? 0.86 : 1,
                },
              ]}>
              <Text style={styles.floatingActionIcon}>+</Text>
              {floatingAction.label ? (
                <Text style={styles.floatingActionText}>{floatingAction.label}</Text>
              ) : null}
            </Pressable>
          </View>
        </View>
      ) : null}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardRoot: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    alignItems: 'center',
  },
  frame: {
    width: '100%',
    maxWidth: MaxContentWidth,
    gap: Spacing.five,
  },
  headerCard: {
    borderWidth: 1,
    borderRadius: Radii.large,
    padding: Spacing.five,
  },
  headerContent: {
    gap: Spacing.four,
  },
  headingStack: {
    gap: Spacing.two,
  },
  headerArt: {
    marginBottom: Spacing.one,
  },
  eyebrow: {
    fontFamily: Fonts.sans,
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1.1,
  },
  title: {
    fontFamily: Fonts.rounded,
    fontSize: 34,
    lineHeight: 40,
    fontWeight: '800',
  },
  subtitle: {
    fontFamily: Fonts.sans,
    fontSize: 16,
    lineHeight: 24,
    maxWidth: 720,
  },
  headerMeta: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: Spacing.three,
  },
  headerAccessory: {
    marginLeft: 'auto',
  },
  badge: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: Radii.pill,
    borderWidth: 1,
  },
  badgeText: {
    fontFamily: Fonts.sans,
    fontSize: 12,
    fontWeight: '700',
  },
  sectionStack: {
    gap: Spacing.five,
  },
  floatingAdDock: {
    position: 'absolute',
    left: 0,
    right: 0,
    paddingHorizontal: Spacing.three,
    alignItems: 'center',
  },
  floatingActionDock: {
    position: 'absolute',
    left: 0,
    right: 0,
    paddingHorizontal: Spacing.four,
    alignItems: 'center',
  },
  floatingActionFrame: {
    width: '100%',
    maxWidth: MaxContentWidth,
    alignItems: 'flex-end',
  },
  floatingActionButton: {
    width: 62,
    height: 62,
    borderRadius: 31,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  floatingActionButtonExtended: {
    width: 'auto',
    minWidth: 62,
    paddingHorizontal: Spacing.four,
    flexDirection: 'row',
    gap: Spacing.two,
  },
  floatingActionIcon: {
    marginTop: -2,
    fontFamily: Fonts.rounded,
    fontSize: 30,
    lineHeight: 34,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  floatingActionText: {
    fontFamily: Fonts.sans,
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});
