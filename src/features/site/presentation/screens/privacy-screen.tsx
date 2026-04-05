import React from 'react';
import { Text, StyleSheet } from 'react-native';

import { Fonts } from '@/constants/theme';
import { HOME_BASKET_SUPPORT_EMAIL } from '@/shared/config/app-links';
import { BrandHero, ScreenShell, SectionCard } from '@/shared/ui';
import { useTheme } from '@/hooks/use-theme';

export default function PrivacyScreen() {
  const theme = useTheme();

  return (
    <ScreenShell
      eyebrow="Privacy"
      title="Privacy Policy"
      headerArt={<BrandHero width={180} />}
      subtitle="How Home Basket handles household data, accounts, receipts, and shared shopping records.">
      <SectionCard title="Effective date" description="April 5, 2026">
        <Text style={[styles.body, { color: theme.textMuted }]}>
          Home Basket is published by Transcripe.
        </Text>
      </SectionCard>

      <SectionCard title="What Home Basket collects">
        <Text style={[styles.body, { color: theme.textMuted }]}>
          Home Basket may store account email addresses, Firebase authentication identifiers,
          household names, member names, invite codes, shopping items, reminders, purchase totals,
          notes, purchase history, receipt images, and related receipt metadata.
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
          and Cloud Storage. Data may be processed by Google and its service providers. Household
          data is also shared with other members of the same household because that is part of the
          shared-list experience.
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

