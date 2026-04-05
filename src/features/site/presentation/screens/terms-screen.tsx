import React from 'react';
import { Text, StyleSheet } from 'react-native';

import { Fonts } from '@/constants/theme';
import {
  HOME_BASKET_SUPPORT_EMAIL,
  HOME_BASKET_WEBSITE,
} from '@/shared/config/app-links';
import { BrandHero, ScreenShell, SectionCard } from '@/shared/ui';
import { useTheme } from '@/hooks/use-theme';
import { PublicPageNav } from '../components/public-page-nav';

export default function TermsScreen() {
  const theme = useTheme();

  return (
    <ScreenShell
      eyebrow="Terms"
      title="Terms of Use"
      headerArt={<BrandHero width={180} />}
      subtitle="A clear summary of how Home Basket may be used and what the service does and does not guarantee.">
      <PublicPageNav active="terms" />
      <SectionCard title="Effective date" description="April 5, 2026">
        <Text style={[styles.body, { color: theme.textMuted }]}>
          These Terms of Use govern your use of Home Basket, provided by Transcripe.
        </Text>
      </SectionCard>

      <SectionCard title="Use of the service">
        <Text style={[styles.body, { color: theme.textMuted }]}>
          You may use Home Basket only in compliance with applicable laws and these Terms. You
          agree not to misuse the service, interfere with it, attempt unauthorized access, or use
          it in a way that harms other users.
        </Text>
      </SectionCard>

      <SectionCard title="Accounts and shared households">
        <Text style={[styles.body, { color: theme.textMuted }]}>
          You are responsible for keeping access to your device and linked account secure. If you
          join or create a household, data may be shared with other members of that household as
          part of the shared experience.
        </Text>
      </SectionCard>

      <SectionCard title="Product scope disclaimer">
        <Text style={[styles.body, { color: theme.textMuted }]}>
          Home Basket is an organizational tool. It is not a bank, accounting platform, tax tool,
          financial advisory service, or legal recordkeeping platform. Budgets, totals, reminders,
          receipt extraction, and purchase summaries are provided for convenience and may contain
          mistakes or omissions.
        </Text>
      </SectionCard>

      <SectionCard title="Availability and liability">
        <Text style={[styles.body, { color: theme.textMuted }]}>
          We may change, suspend, or discontinue parts of the service at any time, and we do not
          guarantee uninterrupted availability. To the maximum extent allowed by law, Transcripe is
          not liable for indirect, incidental, special, consequential, or punitive damages arising
          from use of Home Basket.
        </Text>
      </SectionCard>

      <SectionCard title="Contact">
        <Text style={[styles.body, { color: theme.textMuted }]}>
          Questions about these Terms can be sent to {HOME_BASKET_SUPPORT_EMAIL}. Website:{' '}
          {HOME_BASKET_WEBSITE}
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
});
