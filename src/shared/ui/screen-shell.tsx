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
import { usePathname, useRouter } from 'expo-router';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Fonts, MaxContentWidth, Radii, Shadows, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { MobileBannerAd } from '@/shared/ads';
import { WebFooter } from './web-footer';

const swipeRoutes = ['/', '/purchases', '/household'] as const;

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
}: ScreenShellProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const pathname = usePathname();
  const router = useRouter();

  const topPadding = Platform.select({
    web: Spacing.seven,
    default: insets.top + Spacing.five,
  });

  const bottomPadding = Platform.select({
    web: Spacing.seven,
    default: insets.bottom + Spacing.six,
  });

  const activeSwipeIndex = (swipeRoutes as readonly string[]).indexOf(pathname);
  const canSwipeNavigate =
    swipeNavigationEnabled && Platform.OS !== 'web' && activeSwipeIndex !== -1;

  const nativeGesture = React.useMemo(() => Gesture.Native(), []);
  const swipeGesture = React.useMemo(
    () =>
      Gesture.Pan()
        .enabled(canSwipeNavigate)
        .runOnJS(true)
        .simultaneousWithExternalGesture(nativeGesture)
        .activeOffsetX([-16, 16])
        .failOffsetY([-64, 64])
        .onEnd((event) => {
          if (
            !canSwipeNavigate ||
            Math.abs(event.translationX) < 56 ||
            Math.abs(event.translationX) < Math.abs(event.translationY) * 1.2
          ) {
            return;
          }

          const direction = event.translationX < 0 ? 1 : -1;
          const nextRoute = swipeRoutes[activeSwipeIndex + direction];

          if (nextRoute && nextRoute !== pathname) {
            router.replace(nextRoute);
          }
        }),
    [activeSwipeIndex, canSwipeNavigate, nativeGesture, pathname, router]
  );

  const content = (
    <ScrollView
      style={styles.scroll}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
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
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      {canSwipeNavigate ? (
        <GestureDetector gesture={Gesture.Simultaneous(nativeGesture, swipeGesture)}>
          {content}
        </GestureDetector>
      ) : (
        content
      )}
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
