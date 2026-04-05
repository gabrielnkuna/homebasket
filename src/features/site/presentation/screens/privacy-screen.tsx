import React from 'react';
import { Text, StyleSheet } from 'react-native';

import { Fonts } from '@/constants/theme';
import { HOME_BASKET_SUPPORT_EMAIL } from '@/shared/config/app-links';
import { BrandHero, ScreenShell, SectionCard } from '@/shared/ui';
import { useTheme } from '@/hooks/use-theme';
import { PublicPageNav } from '../components/public-page-nav';

export default function PrivacyScreen() {
  const theme = useTheme();

  return (
    <ScreenShell
      eyebrow="Privacy"
      title="Privacy Policy"
      headerArt={<BrandHero width={180} />}
      subtitle="How Home Basket handles household data, accounts, receipts, shared shopping records, and limited sponsored messages on mobile.">
      <PublicPageNav active="privacy" />
      <SectionCard title="Effective date" description="April 5, 2026">
        <Text style={[styles.body, { color: theme.textMuted }]}>
          Home Basket is published by Transcripe.
        </Text>
      </SectionCard>

      <SectionCard title="What Home Basket collects">
        <Text style={[styles.body, { color: theme.textMuted }]}>
          Home Basket may store account email addresses, Firebase authentication identifiers,
          household names, member names, invite codes, shopping items, reminders, purchase totals,
          notes, purchase history, receipt images, related receipt metadata, and if mobile ads are
          enabled, advertising consent signals, approximate region for consent handling, and basic
          ad interaction diagnostics.
        </Text>
      </SectionCard>

      <SectionCard title="How information is used">
        <Text style={[styles.body, { color: theme.textMuted }]}>
          This information is used to run the service, sync household data across devices,
          restore linked sessions, store purchases and receipts, support reminders and budgeting,
          maintain security, and respond to support or deletion requests.
        </Text>
      </SectionCard>

      <SectionCard title="Infrastructure and sharing">
        <Text style={[styles.body, { color: theme.textMuted }]}>
          Home Basket uses Firebase services, including Firebase Authentication, Cloud Firestore,
          and Cloud Storage. If mobile ads are enabled, Home Basket also uses Google AdMob and
          Google User Messaging Platform tooling to request consent and serve sponsored messages.
          Data may be processed by Google and its service providers. Household data is also shared
          with other members of the same household because that is part of the shared-list
          experience.
        </Text>
      </SectionCard>

      <SectionCard title="Ads and consent">
        <Text style={[styles.body, { color: theme.textMuted }]}>
          On supported Android and iPhone builds, Home Basket may show banner ads or occasional
          full-screen sponsored messages. These ads are intended to be relevant to shopping and
          household services, but they are provided by Google advertising systems and demand
          partners. Where required by law, Home Basket requests advertising consent and provides an
          in-app way to review ad choices again later.
        </Text>
      </SectionCard>

      <SectionCard title="Retention and deletion">
        <Text style={[styles.body, { color: theme.textMuted }]}>
          Data is kept only as long as reasonably necessary to provide the service, maintain
          household continuity, resolve disputes, and meet legal or security obligations. For
          account or data deletion requests, contact {HOME_BASKET_SUPPORT_EMAIL}.
        </Text>
      </SectionCard>

      <SectionCard title="Security and international use">
        <Text style={[styles.body, { color: theme.textMuted }]}>
          Home Basket uses reasonable technical and organizational safeguards, but no storage or
          transmission system is perfectly secure. If you use Home Basket outside the country where
          the service is operated, your data may be transferred to and processed in other countries
          where service providers operate.
        </Text>
      </SectionCard>

      <SectionCard title="Contact">
        <Text style={[styles.body, { color: theme.textMuted }]}>
          For privacy questions or deletion requests, contact {HOME_BASKET_SUPPORT_EMAIL}.
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
