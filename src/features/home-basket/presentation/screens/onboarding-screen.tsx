import React from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';

import { Fonts, Radii, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import {
  getDeviceCurrencyCode,
  getSuggestedCurrencyCodes,
} from '@/shared/locale/currency-preferences';
import {
  ActionButton,
  BrandBadge,
  BrandHero,
  CurrencySelector,
  MessageBanner,
  PillButton,
  ScreenShell,
  SectionCard,
} from '@/shared/ui';
import { useHomeBasketStore } from '@/features/home-basket/presentation/use-home-basket-store';

export default function OnboardingScreen() {
  const theme = useTheme();
  const detectedCurrencyCode = getDeviceCurrencyCode();
  const syncMode = useHomeBasketStore((state) => state.syncMode);
  const demoInviteCode = useHomeBasketStore((state) => state.demoInviteCode);
  const authSession = useHomeBasketStore((state) => state.authSession);
  const onboardingMode = useHomeBasketStore((state) => state.onboardingMode);
  const createHouseholdDraft = useHomeBasketStore((state) => state.createHouseholdDraft);
  const joinHouseholdDraft = useHomeBasketStore((state) => state.joinHouseholdDraft);
  const signInDraft = useHomeBasketStore((state) => state.signInDraft);
  const isSaving = useHomeBasketStore((state) => state.isSaving);
  const error = useHomeBasketStore((state) => state.error);
  const notice = useHomeBasketStore((state) => state.notice);
  const setOnboardingMode = useHomeBasketStore((state) => state.setOnboardingMode);
  const updateCreateHouseholdDraft = useHomeBasketStore((state) => state.updateCreateHouseholdDraft);
  const updateJoinHouseholdDraft = useHomeBasketStore((state) => state.updateJoinHouseholdDraft);
  const updateSignInDraft = useHomeBasketStore((state) => state.updateSignInDraft);
  const signInWithAccount = useHomeBasketStore((state) => state.signInWithAccount);
  const sendPasswordReset = useHomeBasketStore((state) => state.sendPasswordReset);
  const sendVerificationEmail = useHomeBasketStore((state) => state.sendVerificationEmail);
  const refreshAccountStatus = useHomeBasketStore((state) => state.refreshAccountStatus);
  const createHousehold = useHomeBasketStore((state) => state.createHousehold);
  const joinHousehold = useHomeBasketStore((state) => state.joinHousehold);
  const suggestedCurrencyCodes = React.useMemo(
    () => getSuggestedCurrencyCodes(createHouseholdDraft.currencyCode || detectedCurrencyCode),
    [createHouseholdDraft.currencyCode, detectedCurrencyCode]
  );
  const showBudgetCurrencySelector = createHouseholdDraft.monthlyBudget.trim().length > 0;
  const currencyHelperText = detectedCurrencyCode
    ? `Detected from this device: ${detectedCurrencyCode}. Change it if this household budgets in another currency.`
    : 'Choose the currency this household uses. You can change it later from Household.';

  return (
    <ScreenShell
      eyebrow="Shared household shopping list"
      title="Welcome to Home Basket"
      headerArt={<BrandHero width={180} />}
      headerAccessory={<BrandBadge />}
      subtitle="Create a household, join one with an invite code, or restore an existing account."
    >
      <SectionCard
        title="Choose how this device joins the household"
        description="Start a new household, join one with an invite code, or restore an existing account.">
        <View style={styles.rowWrap}>
          <PillButton
            label="Create household"
            active={onboardingMode === 'create'}
            onPress={() => setOnboardingMode('create')}
          />
          <PillButton
            label="Join household"
            active={onboardingMode === 'join'}
            onPress={() => setOnboardingMode('join')}
          />
          {syncMode === 'firestore' ? (
            <PillButton
              label="Restore account"
              active={onboardingMode === 'restore'}
              onPress={() => setOnboardingMode('restore')}
            />
          ) : null}
        </View>

        {syncMode === 'demo' && demoInviteCode ? (
          <View
            style={[
              styles.demoHint,
              {
                backgroundColor: theme.accentSoft,
                borderColor: theme.border,
              },
            ]}>
            <Text style={[styles.demoHintTitle, { color: theme.text }]}>Quick demo code</Text>
            <Text style={[styles.demoHintCopy, { color: theme.textMuted }]}>
              Join the seeded sample household with <Text style={[styles.inlineCode, { color: theme.text }]}>{demoInviteCode}</Text>
            </Text>
          </View>
        ) : null}
      </SectionCard>

      {error ? <MessageBanner message={error} tone="error" /> : null}
      {!error && notice ? <MessageBanner message={notice} /> : null}

      {syncMode === 'firestore' && onboardingMode === 'restore' ? (
        <SectionCard
          title="Restore an existing account"
          description="If you already linked an email and password on another device, sign in here and Home Basket will try to reopen the same household automatically.">
          {authSession?.provider === 'firebase-email-password' && authSession.email ? (
            <View
              style={[
                styles.accountStatus,
                {
                  backgroundColor: theme.primarySoft,
                  borderColor: theme.border,
                },
              ]}>
              <Text style={[styles.accountStatusTitle, { color: theme.text }]}>
                {authSession.emailVerified ? 'Verified account on this browser' : 'Account linked on this browser'}
              </Text>
              <Text style={[styles.accountStatusCopy, { color: theme.textMuted }]}>
                {authSession.emailVerified
                  ? `${authSession.email}. You can keep using this account, or sign in below to switch to a different one.`
                  : `${authSession.email}. Verification is still pending, so open the inbox link when you can and then refresh the account status here.`}
              </Text>

              {!authSession.emailVerified ? (
                <View style={styles.accountActionRow}>
                  <ActionButton
                    label="Send verification email"
                    onPress={() => void sendVerificationEmail()}
                    disabled={isSaving}
                    tone="secondary"
                  />
                  <ActionButton
                    label="Refresh account status"
                    onPress={() => void refreshAccountStatus()}
                    disabled={isSaving}
                    tone="secondary"
                  />
                </View>
              ) : null}
            </View>
          ) : null}

          <View style={styles.formGrid}>
            <View style={styles.fieldBlock}>
              <Text style={[styles.fieldLabel, { color: theme.textMuted }]}>Email</Text>
              <TextInput
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="email-address"
                value={signInDraft.email}
                onChangeText={(email) => updateSignInDraft({ email })}
                placeholder="shopper@homebasket.app"
                placeholderTextColor={theme.textMuted}
                style={[
                  styles.input,
                  {
                    backgroundColor: theme.surface,
                    borderColor: theme.border,
                    color: theme.text,
                  },
                ]}
              />
            </View>
            <View style={styles.fieldBlock}>
              <Text style={[styles.fieldLabel, { color: theme.textMuted }]}>Password</Text>
              <TextInput
                secureTextEntry
                value={signInDraft.password}
                onChangeText={(password) => updateSignInDraft({ password })}
                placeholder="At least 6 characters"
                placeholderTextColor={theme.textMuted}
                style={[
                  styles.input,
                  {
                    backgroundColor: theme.surface,
                    borderColor: theme.border,
                    color: theme.text,
                  },
                ]}
              />
            </View>
          </View>

          <ActionButton
            label={authSession?.provider === 'firebase-email-password' ? 'Switch account' : 'Restore account'}
            onPress={() => void signInWithAccount()}
            disabled={isSaving || !signInDraft.email.trim() || !signInDraft.password}
            tone="secondary"
          />

          <View style={styles.accountActionRow}>
            <ActionButton
              label="Send reset email"
              onPress={() => void sendPasswordReset()}
              disabled={isSaving || !signInDraft.email.trim()}
              tone="secondary"
            />
          </View>
        </SectionCard>
      ) : null}

      {onboardingMode === 'create' ? (
        <SectionCard
          title="Create a new household"
          description="This creates the first member, the shared household profile, and an invite code for everyone else.">
          <View style={styles.formGrid}>
            <View style={styles.gridFieldBlock}>
              <Text style={[styles.fieldLabel, { color: theme.textMuted }]}>Household name</Text>
              <TextInput
                value={createHouseholdDraft.householdName}
                onChangeText={(householdName) => updateCreateHouseholdDraft({ householdName })}
                placeholder="Home Basket"
                placeholderTextColor={theme.textMuted}
                style={[
                  styles.input,
                  {
                    backgroundColor: theme.surface,
                    borderColor: theme.border,
                    color: theme.text,
                  },
                ]}
              />
            </View>
            <View style={styles.gridFieldBlock}>
              <Text style={[styles.fieldLabel, { color: theme.textMuted }]}>Your name</Text>
              <TextInput
                value={createHouseholdDraft.memberName}
                onChangeText={(memberName) => updateCreateHouseholdDraft({ memberName })}
                placeholder="Naledi"
                placeholderTextColor={theme.textMuted}
                style={[
                  styles.input,
                  {
                    backgroundColor: theme.surface,
                    borderColor: theme.border,
                    color: theme.text,
                  },
                ]}
              />
            </View>
          </View>

          <View style={styles.formGrid}>
            <View style={styles.gridFieldBlock}>
              <Text style={[styles.fieldLabel, { color: theme.textMuted }]}>Monthly budget</Text>
              <TextInput
                value={createHouseholdDraft.monthlyBudget}
                onChangeText={(monthlyBudget) => updateCreateHouseholdDraft({ monthlyBudget })}
                keyboardType="decimal-pad"
                placeholder="Optional"
                placeholderTextColor={theme.textMuted}
                style={[
                  styles.input,
                  {
                    backgroundColor: theme.surface,
                    borderColor: theme.border,
                    color: theme.text,
                  },
                ]}
              />
              <Text style={[styles.demoHintCopy, { color: theme.textMuted }]}>
                Leave this blank if you want to start simple. You can switch budget tracking on later from Household.
              </Text>
              {showBudgetCurrencySelector ? (
                <View style={styles.fieldBlock}>
                  <CurrencySelector
                    value={createHouseholdDraft.currencyCode}
                    suggestions={suggestedCurrencyCodes}
                    helperText={currencyHelperText}
                    onChange={(currencyCode) => updateCreateHouseholdDraft({ currencyCode })}
                  />
                </View>
              ) : null}
            </View>
            <View style={styles.gridFieldBlock}>
              <Text style={[styles.fieldLabel, { color: theme.textMuted }]}>Pay day</Text>
              <TextInput
                value={createHouseholdDraft.budgetCycleAnchorDay}
                onChangeText={(budgetCycleAnchorDay) =>
                  updateCreateHouseholdDraft({ budgetCycleAnchorDay })
                }
                keyboardType="number-pad"
                placeholder="25"
                placeholderTextColor={theme.textMuted}
                style={[
                  styles.input,
                  {
                    backgroundColor: theme.surface,
                    borderColor: theme.border,
                    color: theme.text,
                  },
                ]}
              />
              <Text style={[styles.demoHintCopy, { color: theme.textMuted }]}>
                Budgets and spend cycles will start on this pay day each month, not on the 1st.
              </Text>
            </View>
          </View>

          <View style={styles.fieldBlock}>
            <Text style={[styles.fieldLabel, { color: theme.textMuted }]}>
              Primary store
            </Text>
            <TextInput
              value={createHouseholdDraft.primaryStore}
              onChangeText={(primaryStore) => updateCreateHouseholdDraft({ primaryStore })}
              placeholder="Optional"
              placeholderTextColor={theme.textMuted}
              style={[
                styles.input,
                {
                  backgroundColor: theme.surface,
                  borderColor: theme.border,
                  color: theme.text,
                },
              ]}
            />
            <Text style={[styles.demoHintCopy, { color: theme.textMuted }]}>
              Optional. Add it only if the household usually shops in one place.
            </Text>
          </View>

          <ActionButton
            label="Create and continue"
            onPress={() => void createHousehold()}
            disabled={
              isSaving ||
              !createHouseholdDraft.householdName.trim() ||
              !createHouseholdDraft.memberName.trim()
            }
          />
        </SectionCard>
      ) : onboardingMode === 'join' ? (
        <SectionCard
          title="Join with invite code"
          description="Use the invite from the household owner or main shopper. This device will reconnect to the same household automatically.">
          <View style={styles.formGrid}>
            <View style={styles.gridFieldBlock}>
              <Text style={[styles.fieldLabel, { color: theme.textMuted }]}>Invite code</Text>
              <TextInput
                autoCapitalize="characters"
                autoCorrect={false}
                textContentType="oneTimeCode"
                value={joinHouseholdDraft.inviteCode}
                onChangeText={(inviteCode) => updateJoinHouseholdDraft({ inviteCode })}
                placeholder="HB-AB123"
                placeholderTextColor={theme.textMuted}
                style={[
                  styles.input,
                  {
                    backgroundColor: theme.surface,
                    borderColor: theme.border,
                    color: theme.text,
                  },
                ]}
              />
            </View>
            <View style={styles.gridFieldBlock}>
              <Text style={[styles.fieldLabel, { color: theme.textMuted }]}>Your name</Text>
              <TextInput
                value={joinHouseholdDraft.memberName}
                onChangeText={(memberName) => updateJoinHouseholdDraft({ memberName })}
                placeholder="Lindiwe"
                placeholderTextColor={theme.textMuted}
                style={[
                  styles.input,
                  {
                    backgroundColor: theme.surface,
                    borderColor: theme.border,
                    color: theme.text,
                  },
                ]}
              />
            </View>
          </View>

          <ActionButton
            label="Join household"
            onPress={() => void joinHousehold()}
            disabled={
              isSaving ||
              !joinHouseholdDraft.inviteCode.trim() ||
              !joinHouseholdDraft.memberName.trim()
            }
          />
        </SectionCard>
      ) : null}
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  rowWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  demoHint: {
    borderWidth: 1,
    borderRadius: Radii.medium,
    padding: Spacing.three,
    gap: Spacing.one,
  },
  demoHintTitle: {
    fontFamily: Fonts.sans,
    fontSize: 13,
    fontWeight: '800',
  },
  demoHintCopy: {
    fontFamily: Fonts.sans,
    fontSize: 14,
    lineHeight: 22,
  },
  accountStatus: {
    borderWidth: 1,
    borderRadius: Radii.medium,
    padding: Spacing.three,
    gap: Spacing.one,
  },
  accountStatusTitle: {
    fontFamily: Fonts.sans,
    fontSize: 13,
    fontWeight: '800',
  },
  accountStatusCopy: {
    fontFamily: Fonts.sans,
    fontSize: 14,
    lineHeight: 22,
  },
  accountActionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  inlineCode: {
    fontFamily: Fonts.mono,
    fontSize: 13,
  },
  formGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.three,
  },
  fieldBlock: {
    gap: Spacing.two,
  },
  gridFieldBlock: {
    flexBasis: 220,
    flexGrow: 1,
    gap: Spacing.two,
  },
  fieldLabel: {
    fontFamily: Fonts.sans,
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  input: {
    minHeight: 52,
    borderWidth: 1,
    borderRadius: Radii.medium,
    paddingHorizontal: Spacing.three,
    fontFamily: Fonts.sans,
    fontSize: 16,
  },
});
