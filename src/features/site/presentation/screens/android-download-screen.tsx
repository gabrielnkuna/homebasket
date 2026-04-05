import React from 'react';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { Fonts, Radii, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { HOME_BASKET_SUPPORT_EMAIL } from '@/shared/config/app-links';
import { BrandHero, ScreenShell, SectionCard } from '@/shared/ui';

export default function AndroidDownloadScreen() {
  const theme = useTheme();

  return (
    <ScreenShell
      eyebrow="Android"
      title="Get Home Basket on Android"
      headerArt={<BrandHero width={180} />}
      subtitle="The Google Play listing is being prepared. This page is the public Android download home until store release.">
      <SectionCard title="Android app status" description="Google Play release coming soon">
        <Text style={[styles.body, { color: theme.textMuted }]}>
          Home Basket is already running on Android preview builds and is being prepared for Google
          Play submission.
        </Text>
        <Pressable
          accessibilityRole="link"
          onPress={() =>
            void Linking.openURL(
              `mailto:${HOME_BASKET_SUPPORT_EMAIL}?subject=Home%20Basket%20Android%20access`
            )
          }
          style={[
            styles.contactButton,
            {
              backgroundColor: theme.primarySoft,
              borderColor: theme.border,
            },
          ]}>
          <Ionicons name="logo-android" size={20} color={theme.primaryStrong} />
          <View style={styles.contactCopy}>
            <Text style={[styles.contactCaption, { color: theme.textMuted }]}>Need access now?</Text>
            <Text style={[styles.contactLabel, { color: theme.text }]}>Email for Android access</Text>
          </View>
        </Pressable>
      </SectionCard>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  body: {
    fontFamily: Fonts.sans,
    fontSize: 15,
    lineHeight: 24,
  },
  contactButton: {
    marginTop: Spacing.three,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    borderWidth: 1,
    borderRadius: Radii.medium,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
  },
  contactCopy: {
    gap: 2,
  },
  contactCaption: {
    fontFamily: Fonts.sans,
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  contactLabel: {
    fontFamily: Fonts.rounded,
    fontSize: 18,
    fontWeight: '800',
  },
});

