import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import { Fonts, MaxContentWidth, Radii, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import {
  HOME_BASKET_ROUTES,
} from '@/shared/config/app-links';

export function WebFooter() {
  const theme = useTheme();

  const openWebPath = React.useCallback((path: string) => {
    globalThis.location.assign(path);
  }, []);

  if (Platform.OS !== 'web') {
    return null;
  }

  return (
    <View
      style={[
        styles.footer,
        {
          backgroundColor: theme.surface,
          borderColor: theme.border,
        },
      ]}>
      <View style={styles.footerLinks}>
        <Pressable
          accessibilityRole="link"
          onPress={() => openWebPath(HOME_BASKET_ROUTES.privacy)}
          style={styles.footerLink}>
          <Text style={[styles.footerLinkText, { color: theme.textMuted }]}>Privacy</Text>
        </Pressable>
        <Pressable
          accessibilityRole="link"
          onPress={() => openWebPath(HOME_BASKET_ROUTES.terms)}
          style={styles.footerLink}>
          <Text style={[styles.footerLinkText, { color: theme.textMuted }]}>Terms</Text>
        </Pressable>
        <Pressable
          accessibilityRole="link"
          onPress={() => openWebPath(HOME_BASKET_ROUTES.support)}
          style={styles.footerLink}>
          <Text style={[styles.footerLinkText, { color: theme.textMuted }]}>Support</Text>
        </Pressable>
        <Pressable
          accessibilityRole="link"
          onPress={() => openWebPath(HOME_BASKET_ROUTES.deleteAccount)}
          style={styles.footerLink}>
          <Text style={[styles.footerLinkText, { color: theme.textMuted }]}>Delete account</Text>
        </Pressable>
      </View>

      <View style={styles.downloadRow}>
        <Pressable
          accessibilityRole="link"
          onPress={() => openWebPath(HOME_BASKET_ROUTES.android)}
          style={[
            styles.downloadBadge,
            {
              backgroundColor: theme.primarySoft,
              borderColor: theme.border,
            },
          ]}>
          <Ionicons name="logo-android" size={20} color={theme.primaryStrong} />
          <View style={styles.downloadCopy}>
            <Text style={[styles.downloadCaption, { color: theme.textMuted }]}>Get the app</Text>
            <Text style={[styles.downloadLabel, { color: theme.text }]}>Android</Text>
          </View>
        </Pressable>

        <Pressable
          accessibilityRole="link"
          onPress={() => openWebPath(HOME_BASKET_ROUTES.ios)}
          style={[
            styles.downloadBadge,
            {
              backgroundColor: theme.surfaceMuted,
              borderColor: theme.border,
            },
          ]}>
          <Ionicons name="logo-apple" size={20} color={theme.text} />
          <View style={styles.downloadCopy}>
            <Text style={[styles.downloadCaption, { color: theme.textMuted }]}>Get the app</Text>
            <Text style={[styles.downloadLabel, { color: theme.text }]}>iPhone</Text>
          </View>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  footer: {
    width: '100%',
    maxWidth: MaxContentWidth,
    borderWidth: 1,
    borderRadius: Radii.large,
    padding: Spacing.five,
    gap: Spacing.four,
  },
  footerLinks: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.three,
  },
  footerLink: {
    alignSelf: 'flex-start',
  },
  footerLinkText: {
    fontFamily: Fonts.sans,
    fontSize: 14,
    fontWeight: '700',
  },
  downloadRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.three,
  },
  downloadBadge: {
    minWidth: 184,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    borderWidth: 1,
    borderRadius: Radii.medium,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
  },
  downloadCopy: {
    gap: 2,
  },
  downloadCaption: {
    fontFamily: Fonts.sans,
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  downloadLabel: {
    fontFamily: Fonts.rounded,
    fontSize: 18,
    fontWeight: '800',
  },
});
