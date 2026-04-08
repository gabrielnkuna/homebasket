import React, { ReactNode } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
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
}: ScreenShellProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const scrollRef = React.useRef<ScrollView | null>(null);

  const topPadding = Platform.select({
    web: Spacing.seven,
    default: insets.top + Spacing.five,
  });

  const bottomPadding = Platform.select({
    web: Spacing.seven,
    default: insets.bottom + Spacing.six + Spacing.seven,
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

        {swipeNavigationEnabled ? <MobileBannerAd /> : null}

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
});
