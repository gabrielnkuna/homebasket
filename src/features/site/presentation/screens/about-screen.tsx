import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Fonts, Radii, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { BrandHero, ScreenShell, SectionCard } from '@/shared/ui';
import { PublicPageNav } from '../components/public-page-nav';

const benefits = [
  'One shared shopping list for everyone in the household.',
  'Mark items as bought while shopping, then close them into purchase history.',
  'Record purchases with optional spend, receipt proof, and reviewed line items.',
  'Use payday-based monthly budget cycles instead of calendar months.',
  'Add recurring reminders for household staples.',
  'Works across web, Android, and iPhone with live sync when connected.',
];

export default function AboutScreen() {
  const theme = useTheme();

  return (
    <ScreenShell
      eyebrow="About"
      title="Shared shopping list for the whole household"
      headerArt={<BrandHero width={180} />}
      subtitle="Home Basket helps families, roommates, and helpers stay aligned before, during, and after shopping.">
      <PublicPageNav active="about" />

      <SectionCard
        title="What Home Basket does"
        description="A calmer way to coordinate household shopping">
        <Text style={[styles.body, { color: theme.textMuted }]}>
          Home Basket keeps the everyday shopping list, purchase history, receipts, reminders, and
          monthly budget cycle in one shared place. It is built for quick real-life use: add an
          item, mark it bought at the shop, then record the purchase when checkout or delivery is
          done.
        </Text>
      </SectionCard>

      <SectionCard title="Benefits">
        <View style={styles.benefitList}>
          {benefits.map((benefit) => (
            <View key={benefit} style={styles.benefitRow}>
              <View style={[styles.bullet, { backgroundColor: theme.accent }]} />
              <Text style={[styles.body, styles.benefitCopy, { color: theme.textMuted }]}>
                {benefit}
              </Text>
            </View>
          ))}
        </View>
      </SectionCard>

      <SectionCard title="Who it is for">
        <Text style={[styles.body, { color: theme.textMuted }]}>
          Home Basket is useful for households where more than one person adds items, shops, checks
          receipts, or needs visibility into what was already bought. The app is intentionally
          simple so it can work for families, roommates, domestic workers, and small shared homes.
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
  benefitList: {
    gap: Spacing.three,
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.three,
  },
  benefitCopy: {
    flex: 1,
  },
  bullet: {
    width: 9,
    height: 9,
    borderRadius: Radii.pill,
    marginTop: 8,
  },
});
