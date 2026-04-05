import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';

import { Fonts, Radii, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import {
  HOME_BASKET_SUPPORT_EMAIL,
  HOME_BASKET_WEBSITE,
} from '@/shared/config/app-links';
import { BrandHero, ScreenShell, SectionCard } from '@/shared/ui';
import { PublicPageNav } from '../components/public-page-nav';

export default function SupportScreen() {
  const theme = useTheme();

  return (
    <ScreenShell
      eyebrow="Support"
      title="Home Basket support"
      headerArt={<BrandHero width={180} />}
      subtitle="Help, contact details, and the main support path for Home Basket on web, Android, and iPhone.">
      <PublicPageNav active="support" />

      <SectionCard title="Contact support" description="Primary support route">
        <Text style={[styles.body, { color: theme.textMuted }]}>
          Email {HOME_BASKET_SUPPORT_EMAIL} for setup help, account issues, restore problems,
          purchase questions, or store-related support. Include the household name, device type,
          and a short description so we can help faster.
        </Text>

        <Pressable
          accessibilityRole="link"
          onPress={() =>
            void Linking.openURL(
              `mailto:${HOME_BASKET_SUPPORT_EMAIL}?subject=Home%20Basket%20support`
            )
          }
          style={[
            styles.contactButton,
            {
              backgroundColor: theme.primarySoft,
              borderColor: theme.border,
            },
          ]}>
          <Ionicons name="mail-outline" size={20} color={theme.primaryStrong} />
          <View style={styles.contactCopy}>
            <Text style={[styles.contactCaption, { color: theme.textMuted }]}>Email support</Text>
            <Text style={[styles.contactLabel, { color: theme.text }]}>
              {HOME_BASKET_SUPPORT_EMAIL}
            </Text>
          </View>
        </Pressable>
      </SectionCard>

      <SectionCard title="Website">
        <Text style={[styles.body, { color: theme.textMuted }]}>
          Official website: {HOME_BASKET_WEBSITE}
        </Text>
      </SectionCard>

      <SectionCard title="Best info to include">
        <Text style={[styles.body, { color: theme.textMuted }]}>
          Tell us which platform you are using, what happened, what you expected to happen, and the
          email linked to the device if the issue involves account access. Screenshots are welcome.
        </Text>
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
