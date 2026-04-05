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

export default function DeleteAccountScreen() {
  const theme = useTheme();

  return (
    <ScreenShell
      eyebrow="Delete account"
      title="Request account deletion"
      headerArt={<BrandHero width={180} />}
      subtitle="Use this page to request deletion of your Home Basket account and the associated household data linked to it.">
      <PublicPageNav active="deleteAccount" />

      <SectionCard title="How to request deletion" description="Web deletion path">
        <Text style={[styles.body, { color: theme.textMuted }]}>
          Send your deletion request to {HOME_BASKET_SUPPORT_EMAIL}. Use the email address linked
          to the device account if possible, and include the household name so we can locate the
          right data safely.
        </Text>

        <Pressable
          accessibilityRole="link"
          onPress={() =>
            void Linking.openURL(
              `mailto:${HOME_BASKET_SUPPORT_EMAIL}?subject=Home%20Basket%20account%20deletion%20request`
            )
          }
          style={[
            styles.contactButton,
            {
              backgroundColor: theme.surfaceMuted,
              borderColor: theme.border,
            },
          ]}>
          <Ionicons name="trash-outline" size={20} color={theme.text} />
          <View style={styles.contactCopy}>
            <Text style={[styles.contactCaption, { color: theme.textMuted }]}>
              Start deletion request
            </Text>
            <Text style={[styles.contactLabel, { color: theme.text }]}>
              Email delete request
            </Text>
          </View>
        </Pressable>
      </SectionCard>

      <SectionCard title="What deletion covers">
        <Text style={[styles.body, { color: theme.textMuted }]}>
          We will use your request to remove or de-identify the account data linked to you,
          including linked sign-in details, household membership records, and related personal data,
          except where retention is required for security, fraud prevention, or legal compliance.
        </Text>
      </SectionCard>

      <SectionCard title="Before you delete">
        <Text style={[styles.body, { color: theme.textMuted }]}>
          Deleting an account may affect access to shared households, purchase history, receipts,
          reminders, and restore flows on your devices. If you are the only owner of a household,
          ask support first so we can help you avoid locking the home out unexpectedly.
        </Text>
      </SectionCard>

      <SectionCard title="Official website">
        <Text style={[styles.body, { color: theme.textMuted }]}>
          Deletion requests for Home Basket are published at {HOME_BASKET_WEBSITE}/delete-account
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
