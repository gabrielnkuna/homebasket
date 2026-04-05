import React from 'react';
import { Linking, StyleSheet, Text, TextInput, View } from 'react-native';

import { Fonts, Radii, Spacing } from '@/constants/theme';
import {
  reminderCadences,
  shoppingCategories,
} from '@/features/home-basket/domain/models';
import { buildHouseholdScreenModel } from '@/features/home-basket/presentation/selectors';
import { useHomeBasketStore } from '@/features/home-basket/presentation/use-home-basket-store';
import { useTheme } from '@/hooks/use-theme';
import { formatCurrency, formatCurrencyInputValue } from '@/shared/format/currency';
import { formatLongDate } from '@/shared/format/date';
import {
  getDeviceCurrencyCode,
  getSuggestedCurrencyCodes,
} from '@/shared/locale/currency-preferences';
import {
  getHomeBasketAbsoluteUrl,
  HOME_BASKET_ROUTES,
} from '@/shared/config/app-links';
import {
  ActionButton,
  BrandBadge,
  CurrencySelector,
  MessageBanner,
  MetricCard,
  PillButton,
  ScreenShell,
  SectionCard,
} from '@/shared/ui';

export default function HouseholdScreen() {
  const theme = useTheme();
  const snapshot = useHomeBasketStore((state) => state.snapshot);
  const authSession = useHomeBasketStore((state) => state.authSession);
  const session = useHomeBasketStore((state) => state.session);
  const selectedMemberId = useHomeBasketStore((state) => state.selectedMemberId);
  const setSelectedMember = useHomeBasketStore((state) => state.setSelectedMember);
  const syncMode = useHomeBasketStore((state) => state.syncMode);
  const invite = useHomeBasketStore((state) => state.invite);
  const linkAccountDraft = useHomeBasketStore((state) => state.linkAccountDraft);
  const reminderDraft = useHomeBasketStore((state) => state.reminderDraft);
  const createInvite = useHomeBasketStore((state) => state.createInvite);
  const updateLinkAccountDraft = useHomeBasketStore((state) => state.updateLinkAccountDraft);
  const updateReminderDraft = useHomeBasketStore((state) => state.updateReminderDraft);
  const linkAccount = useHomeBasketStore((state) => state.linkAccount);
  const createReminder = useHomeBasketStore((state) => state.createReminder);
  const addReminderToBasket = useHomeBasketStore((state) => state.addReminderToBasket);
  const deleteReminder = useHomeBasketStore((state) => state.deleteReminder);
  const saveCurrencyCode = useHomeBasketStore((state) => state.saveCurrencyCode);
  const saveBudgetCycleAnchorDay = useHomeBasketStore((state) => state.saveBudgetCycleAnchorDay);
  const saveMonthlyBudget = useHomeBasketStore((state) => state.saveMonthlyBudget);
  const sendPasswordReset = useHomeBasketStore((state) => state.sendPasswordReset);
  const sendVerificationEmail = useHomeBasketStore((state) => state.sendVerificationEmail);
  const refreshAccountStatus = useHomeBasketStore((state) => state.refreshAccountStatus);
  const signOut = useHomeBasketStore((state) => state.signOut);
  const isSaving = useHomeBasketStore((state) => state.isSaving);
  const error = useHomeBasketStore((state) => state.error);
  const notice = useHomeBasketStore((state) => state.notice);
  const detectedCurrencyCode = getDeviceCurrencyCode();
  const budgetCycleAnchorDay = snapshot?.household.budgetCycleAnchorDay ?? 25;
  const [budgetCycleAnchorDayInput, setBudgetCycleAnchorDayInput] = React.useState(
    String(budgetCycleAnchorDay)
  );
  const [currencyCodeInput, setCurrencyCodeInput] = React.useState(
    snapshot?.household.currencyCode ?? detectedCurrencyCode ?? 'USD'
  );
  const [monthlyBudgetInput, setMonthlyBudgetInput] = React.useState(
    snapshot?.household.monthlyBudgetCents
      ? formatCurrencyInputValue(snapshot.household.monthlyBudgetCents)
      : ''
  );

  React.useEffect(() => {
    setBudgetCycleAnchorDayInput(String(budgetCycleAnchorDay));
  }, [budgetCycleAnchorDay]);

  React.useEffect(() => {
    setCurrencyCodeInput(snapshot?.household.currencyCode ?? detectedCurrencyCode ?? 'USD');
  }, [detectedCurrencyCode, snapshot?.household.currencyCode]);

  React.useEffect(() => {
    setMonthlyBudgetInput(
      snapshot?.household.monthlyBudgetCents
        ? formatCurrencyInputValue(snapshot.household.monthlyBudgetCents)
        : ''
    );
  }, [snapshot?.household.monthlyBudgetCents]);

  if (!snapshot) {
    return (
      <ScreenShell
        eyebrow="Household"
        title="Household setup"
        subtitle="Loading the home profile and member roster...">
        <SectionCard tone="muted">
          <Text style={[styles.emptyMessage, { color: theme.textMuted }]}>
            Preparing the household snapshot.
          </Text>
        </SectionCard>
      </ScreenShell>
    );
  }

  const model = buildHouseholdScreenModel(snapshot);
  const hasBudget = snapshot.household.monthlyBudgetCents > 0;
  const suggestedCurrencyCodes = getSuggestedCurrencyCodes(
    currencyCodeInput || snapshot.household.currencyCode
  );
  const currencyHelperText =
    session?.memberRole === 'Owner'
      ? detectedCurrencyCode
        ? `Detected from this device: ${detectedCurrencyCode}. Change it if the household budgets in another currency.`
        : 'Choose the currency this household uses for budgets and purchases.'
      : 'Only the household owner can change the household currency.';

  return (
    <ScreenShell
      eyebrow="Household"
      title="Who is shopping this week?"
      swipeNavigationEnabled
      headerAccessory={<BrandBadge />}
      subtitle="Keep the shared list simple: everyone can add items, one shopper closes the trip, and the household always sees the current state.">
      {error ? <MessageBanner message={error} tone="error" /> : null}
      {!error && notice ? <MessageBanner message={notice} /> : null}

      <SectionCard
        title="Household invite"
        description="Share this code with another family member or domestic worker so they can join the same basket on their own device. Each device keeps its own linked member profile in live sync mode.">
        <View
          style={[
            styles.inviteBox,
            {
              backgroundColor: theme.surface,
              borderColor: theme.border,
            },
          ]}>
          <Text style={[styles.inviteCode, { color: theme.text }]}>
            {invite?.code ?? 'No invite generated yet'}
          </Text>
          <Text style={[styles.inviteCopy, { color: theme.textMuted }]}>
            {invite
              ? 'Latest active code for this household, ready for another authenticated device to join.'
              : 'Generate the first invite code for this household.'}
          </Text>
        </View>

        <View style={styles.actionRow}>
          <ActionButton
            label={invite ? 'Create fresh invite' : 'Generate invite'}
            onPress={() => void createInvite()}
            disabled={isSaving}
          />
          <ActionButton
            label="Sign out on this device"
            tone="secondary"
            onPress={() => void signOut()}
            disabled={isSaving}
          />
        </View>
      </SectionCard>

      <View style={styles.metricGrid}>
        <MetricCard
          label="Monthly budget"
          value={
            hasBudget
              ? formatCurrency(snapshot.household.monthlyBudgetCents, snapshot.household.currencyCode)
              : 'Not set'
          }
          helper={snapshot.household.primaryStore || 'Optional until you activate it'}
          tone="accent"
        />
        <MetricCard
          label="Active categories"
          value={String(model.dashboard.activeCategoryCount)}
          helper="Produce, pantry, dairy, and more"
        />
        <MetricCard
          label="Completion rate"
          value={`${Math.round(model.dashboard.completionRate * 100)}%`}
          helper="Of active items currently marked as bought"
          tone="primary"
        />
      </View>

      <SectionCard
        title="Budget cycle"
        description="The household month follows payday instead of the calendar month, so spend and discipline can line up with the real budget window."
        tone="emphasis">
        <View style={styles.summaryGrid}>
          <View style={styles.summaryBlock}>
            <Text style={[styles.summaryLabel, { color: theme.textMuted }]}>Shopper of the week</Text>
            <Text style={[styles.summaryValue, { color: theme.text }]}>
              {model.shopperOfWeek?.name ?? 'Assign a shopper'}
            </Text>
          </View>
          <View style={styles.summaryBlock}>
            <Text style={[styles.summaryLabel, { color: theme.textMuted }]}>Pay day</Text>
            <Text style={[styles.summaryValue, { color: theme.text }]}>
              {model.budgetCycleAnchorDayLabel}
            </Text>
          </View>
          <View style={styles.summaryBlock}>
            <Text style={[styles.summaryLabel, { color: theme.textMuted }]}>Current cycle</Text>
            <Text style={[styles.summaryValue, { color: theme.text }]}>
              {model.budgetCycleRangeLabel}
            </Text>
          </View>
          <View style={styles.summaryBlock}>
            <Text style={[styles.summaryLabel, { color: theme.textMuted }]}>Spend this cycle</Text>
            <Text style={[styles.summaryValue, { color: theme.text }]}>
              {formatCurrency(model.dashboard.budgetCycleSpendCents, snapshot.household.currencyCode)}
            </Text>
          </View>
        </View>

        {hasBudget ? (
          <>
            <View style={[styles.progressTrack, { backgroundColor: theme.surface }]}>
              <View
                style={[
                  styles.progressFill,
                  {
                    backgroundColor: theme.primary,
                    width: `${Math.max(model.budgetProgress * 100, 10)}%`,
                  },
                ]}
              />
            </View>
            <Text style={[styles.supportText, { color: theme.textMuted }]}>
              {formatCurrency(model.dashboard.budgetRemainingCents, snapshot.household.currencyCode)} left in the current monthly budget for this household cycle.
            </Text>
          </>
        ) : (
          <Text style={[styles.supportText, { color: theme.textMuted }]}>
            No monthly budget is active yet. Leave it off while the household gets comfortable, or turn it on below when you want spend tracking.
          </Text>
        )}

        <View style={styles.fieldBlock}>
          <CurrencySelector
            value={currencyCodeInput}
            suggestions={suggestedCurrencyCodes}
            helperText={currencyHelperText}
            editable={session?.memberRole === 'Owner'}
            onChange={setCurrencyCodeInput}
          />
          {session?.memberRole === 'Owner' ? (
            <View style={styles.actionRow}>
              <ActionButton
                label="Save currency"
                onPress={() => void saveCurrencyCode(currencyCodeInput)}
                disabled={isSaving}
                tone="secondary"
              />
            </View>
          ) : null}
        </View>

        <View style={styles.fieldBlock}>
          <Text style={[styles.fieldLabel, { color: theme.textMuted }]}>Monthly budget</Text>
          <View style={styles.formGrid}>
            <View style={styles.gridFieldBlock}>
              <TextInput
                value={monthlyBudgetInput}
                onChangeText={setMonthlyBudgetInput}
                keyboardType="decimal-pad"
                placeholder="Optional"
                placeholderTextColor={theme.textMuted}
                editable={session?.memberRole === 'Owner'}
                style={[
                  styles.input,
                  {
                    backgroundColor: theme.surface,
                    borderColor: theme.border,
                    color: theme.text,
                    opacity: session?.memberRole === 'Owner' ? 1 : 0.7,
                  },
                ]}
              />
            </View>
            {session?.memberRole === 'Owner' ? (
              <View style={styles.inlineActionBlock}>
                <ActionButton
                  label={monthlyBudgetInput.trim() ? 'Save monthly budget' : 'Turn budget off'}
                  onPress={() => void saveMonthlyBudget(monthlyBudgetInput)}
                  disabled={isSaving}
                  tone="secondary"
                />
              </View>
            ) : null}
          </View>
          <Text style={[styles.supportText, { color: theme.textMuted }]}>
            {session?.memberRole === 'Owner'
              ? 'Leave it blank to keep budget tracking off for now.'
              : 'Only the household owner can change the monthly budget.'}
          </Text>
        </View>

        <View style={styles.fieldBlock}>
          <Text style={[styles.fieldLabel, { color: theme.textMuted }]}>Cycle start day</Text>
          <View style={styles.formGrid}>
            <View style={styles.gridFieldBlock}>
              <TextInput
                value={budgetCycleAnchorDayInput}
                onChangeText={setBudgetCycleAnchorDayInput}
                keyboardType="number-pad"
                placeholder="25"
                placeholderTextColor={theme.textMuted}
                editable={session?.memberRole === 'Owner'}
                style={[
                  styles.input,
                  {
                    backgroundColor: theme.surface,
                    borderColor: theme.border,
                    color: theme.text,
                    opacity: session?.memberRole === 'Owner' ? 1 : 0.7,
                  },
                ]}
              />
            </View>
            {session?.memberRole === 'Owner' ? (
              <View style={styles.inlineActionBlock}>
                <ActionButton
                  label="Save pay day"
                  onPress={() => void saveBudgetCycleAnchorDay(budgetCycleAnchorDayInput)}
                  disabled={isSaving}
                  tone="secondary"
                />
              </View>
            ) : null}
          </View>
          <Text style={[styles.supportText, { color: theme.textMuted }]}>
            {session?.memberRole === 'Owner'
              ? 'Use the main pay day for the household. The current cycle range updates immediately.'
              : 'Only the household owner can change the pay day cycle.'}
          </Text>
        </View>
      </SectionCard>

      <SectionCard
        title="Estimated spend mix"
        description="A lightweight category view of the current budget cycle, estimated from the purchased item mix in each purchase.">
        {model.dashboard.budgetCycleCategorySpend.length === 0 ? (
          <Text style={[styles.emptyMessage, { color: theme.textMuted }]}>
            Record a few purchases first and Home Basket will show which categories are taking the biggest share of this monthly budget.
          </Text>
        ) : (
          model.dashboard.budgetCycleCategorySpend.slice(0, 5).map((insight) => (
            <View
              key={insight.category}
              style={[
                styles.spendMixRow,
                {
                  backgroundColor: theme.surface,
                  borderColor: theme.border,
                },
              ]}>
              <View style={styles.spendMixCopy}>
                <View style={styles.spendMixHeading}>
                  <Text style={[styles.memberName, { color: theme.text }]}>{insight.category}</Text>
                  <Text style={[styles.spendMixAmount, { color: theme.primaryStrong }]}>
                    {formatCurrency(insight.estimatedSpendCents, snapshot.household.currencyCode)}
                  </Text>
                </View>
                <View style={[styles.progressTrack, { backgroundColor: theme.surfaceMuted }]}>
                  <View
                    style={[
                      styles.progressFill,
                      {
                        backgroundColor: theme.primary,
                        width: `${Math.max(insight.shareOfBudgetCycleSpend * 100, 8)}%`,
                      },
                    ]}
                  />
                </View>
                <Text style={[styles.memberRole, { color: theme.textMuted }]}>
                  About {Math.round(insight.shareOfBudgetCycleSpend * 100)}% of this cycle&apos;s recorded spend from {insight.purchasedItemsCount} purchased item
                  {insight.purchasedItemsCount === 1 ? '' : 's'} across {insight.tripsCount} purchase
                  {insight.tripsCount === 1 ? '' : 's'}.
                </Text>
              </View>
            </View>
          ))
        )}
      </SectionCard>

      <SectionCard
        title="Acting member"
        description="Choose who is currently using the app on this device. New items and purchases will use that member by default.">
        <View style={styles.rowWrap}>
          {snapshot.members.map((member) => (
            <PillButton
              key={member.id}
              label={member.name}
              active={member.id === selectedMemberId}
              onPress={() => setSelectedMember(member.id)}
            />
          ))}
        </View>
      </SectionCard>

      <SectionCard
        title="Shopping reminders"
        description="Set lightweight recurring reminders for staples so the basket nudges the household at the right time without becoming a full planner.">
        <View style={styles.formGrid}>
          <View style={styles.gridFieldBlock}>
            <Text style={[styles.fieldLabel, { color: theme.textMuted }]}>Reminder</Text>
            <TextInput
              value={reminderDraft.title}
              onChangeText={(title) => updateReminderDraft({ title })}
              placeholder="Dog food, bread, bleach..."
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
            <Text style={[styles.fieldLabel, { color: theme.textMuted }]}>Quantity</Text>
            <TextInput
              value={reminderDraft.quantity}
              onChangeText={(quantity) => updateReminderDraft({ quantity })}
              placeholder="1 pack"
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
            <Text style={[styles.fieldLabel, { color: theme.textMuted }]}>Next due date</Text>
            <TextInput
              value={reminderDraft.nextDueAt}
              onChangeText={(nextDueAt) => updateReminderDraft({ nextDueAt })}
              placeholder="2026-04-05"
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

        <View style={styles.fieldBlock}>
          <Text style={[styles.fieldLabel, { color: theme.textMuted }]}>Category</Text>
          <View style={styles.rowWrap}>
            {shoppingCategories.map((category) => (
              <PillButton
                key={category}
                label={category}
                active={reminderDraft.category === category}
                onPress={() => updateReminderDraft({ category, customCategory: '' })}
              />
            ))}
          </View>
        </View>

        <View style={styles.fieldBlock}>
          <Text style={[styles.fieldLabel, { color: theme.textMuted }]}>
            Custom category
          </Text>
          <TextInput
            value={reminderDraft.customCategory}
            onChangeText={(customCategory) => updateReminderDraft({ customCategory })}
            placeholder="Optional: Gardening, Hardware..."
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
          <Text style={[styles.supportText, { color: theme.textMuted }]}>
            Use this when the reminder belongs in something more specific than the shared category
            list. Blank falls back to the selected category above.
          </Text>
        </View>

        <View style={styles.fieldBlock}>
          <Text style={[styles.fieldLabel, { color: theme.textMuted }]}>Cadence</Text>
          <View style={styles.rowWrap}>
            {reminderCadences.map((cadence) => (
              <PillButton
                key={cadence}
                label={
                  cadence === 'fortnightly'
                    ? 'Every 2 weeks'
                    : cadence === 'monthly'
                      ? 'Every month'
                      : 'Every week'
                }
                active={reminderDraft.cadence === cadence}
                onPress={() => updateReminderDraft({ cadence })}
              />
            ))}
          </View>
        </View>

        <View style={styles.fieldBlock}>
          <Text style={[styles.fieldLabel, { color: theme.textMuted }]}>Notes</Text>
          <TextInput
            value={reminderDraft.note}
            onChangeText={(note) => updateReminderDraft({ note })}
            multiline
            placeholder="Optional note for the household..."
            placeholderTextColor={theme.textMuted}
            style={[
              styles.textArea,
              {
                backgroundColor: theme.surface,
                borderColor: theme.border,
                color: theme.text,
              },
            ]}
          />
        </View>

        <ActionButton
          label="Save reminder"
          onPress={() => void createReminder()}
          disabled={isSaving || !reminderDraft.title.trim()}
          tone="secondary"
        />

        {model.reminders.length === 0 ? (
          <Text style={[styles.emptyMessage, { color: theme.textMuted }]}>
            No reminders yet. Create one for the staples this household buys on a rhythm.
          </Text>
        ) : (
          model.reminders.map((reminder) => (
            <View
              key={reminder.id}
              style={[
                styles.memberRow,
                {
                  backgroundColor: theme.surface,
                  borderColor: theme.border,
                },
              ]}>
              <View style={styles.memberCopy}>
                <Text style={[styles.memberName, { color: theme.text }]}>{reminder.title}</Text>
                <Text style={[styles.memberRole, { color: theme.textMuted }]}>
                  {reminder.quantity} - {reminder.category} - {formatLongDate(reminder.nextDueAt)} -{' '}
                  {reminder.cadence === 'fortnightly'
                    ? 'Every 2 weeks'
                    : reminder.cadence === 'monthly'
                      ? 'Every month'
                      : 'Every week'}
                </Text>
                {reminder.note ? (
                  <Text style={[styles.memberRole, { color: theme.textMuted }]}>{reminder.note}</Text>
                ) : null}
              </View>
              <View style={styles.listActionColumn}>
                <ActionButton
                  label="Add now"
                  tone="secondary"
                  onPress={() => void addReminderToBasket(reminder.id)}
                  disabled={isSaving}
                />
                <ActionButton
                  label="Remove"
                  tone="secondary"
                  onPress={() => void deleteReminder(reminder.id)}
                  disabled={isSaving}
                />
              </View>
            </View>
          ))
        )}
      </SectionCard>

      {syncMode === 'firestore' ? (
        <SectionCard
          title="Account security"
          description="Link this device to an email and password so the same household can be restored deliberately on another browser or phone.">
          {authSession?.provider === 'firebase-email-password' && authSession.email ? (
            <View
              style={[
                styles.securityStatus,
                {
                  backgroundColor: theme.primarySoft,
                  borderColor: theme.border,
                },
              ]}>
              <Text style={[styles.securityStatusTitle, { color: theme.text }]}>
                {authSession.emailVerified ? 'Account verified' : 'Account verification pending'}
              </Text>
              <Text style={[styles.securityStatusCopy, { color: theme.textMuted }]}>
                {authSession.emailVerified
                  ? `This device is secured with ${authSession.email}. Use the same email and password on another browser or phone to reopen this household.`
                  : `This device is linked to ${authSession.email}, but the email is not verified yet. Open the inbox link when you can, then refresh the account status here.`}
              </Text>

              <View style={styles.actionRow}>
                {!authSession.emailVerified ? (
                  <>
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
                  </>
                ) : null}
                <ActionButton
                  label="Send password reset"
                  onPress={() => void sendPasswordReset(authSession.email ?? undefined)}
                  disabled={isSaving || !authSession.email}
                  tone="secondary"
                />
              </View>
            </View>
          ) : (
            <>
              <View style={styles.formGrid}>
                <View style={styles.gridFieldBlock}>
                  <Text style={[styles.fieldLabel, { color: theme.textMuted }]}>Email</Text>
                  <TextInput
                    autoCapitalize="none"
                    autoCorrect={false}
                    keyboardType="email-address"
                    value={linkAccountDraft.email}
                    onChangeText={(email) => updateLinkAccountDraft({ email })}
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
                <View style={styles.gridFieldBlock}>
                  <Text style={[styles.fieldLabel, { color: theme.textMuted }]}>Password</Text>
                  <TextInput
                    secureTextEntry
                    value={linkAccountDraft.password}
                    onChangeText={(password) => updateLinkAccountDraft({ password })}
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
                <View style={styles.gridFieldBlock}>
                  <Text style={[styles.fieldLabel, { color: theme.textMuted }]}>
                    Confirm password
                  </Text>
                  <TextInput
                    secureTextEntry
                    value={linkAccountDraft.confirmPassword}
                    onChangeText={(confirmPassword) => updateLinkAccountDraft({ confirmPassword })}
                    placeholder="Repeat the password"
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
                label="Secure this device account"
                onPress={() => void linkAccount()}
                disabled={
                  isSaving ||
                  !linkAccountDraft.email.trim() ||
                  !linkAccountDraft.password ||
                  !linkAccountDraft.confirmPassword
                }
                tone="secondary"
              />
            </>
          )}

          <View style={styles.fieldBlock}>
            <Text style={[styles.supportText, { color: theme.textMuted }]}>
              Need to delete the linked account or request data deletion? Use the public deletion
              page so the same path works on web, Android, and iPhone.
            </Text>
            <View style={styles.actionRow}>
              <ActionButton
                label="Delete account options"
                tone="secondary"
                onPress={() =>
                  void Linking.openURL(
                    getHomeBasketAbsoluteUrl(HOME_BASKET_ROUTES.deleteAccount)
                  )
                }
                disabled={isSaving}
              />
            </View>
          </View>
        </SectionCard>
      ) : null}

      <SectionCard
        title="Household roster"
        description="Roles are light-touch so the app stays friendly for family members and domestic workers alike.">
        {snapshot.members.map((member) => {
          const isSelected = member.id === selectedMemberId;

          return (
            <View
              key={member.id}
              style={[
                styles.memberRow,
                {
                  backgroundColor: isSelected ? theme.primarySoft : theme.surface,
                  borderColor: theme.border,
                },
              ]}>
              <View
                style={[
                  styles.memberBadge,
                  {
                    backgroundColor: isSelected ? theme.primary : theme.surfaceMuted,
                    borderColor: theme.border,
                  },
                ]}>
                <Text style={[styles.memberBadgeText, { color: isSelected ? '#FFFFFF' : theme.text }]}>
                  {member.initials}
                </Text>
              </View>
              <View style={styles.memberCopy}>
                <Text style={[styles.memberName, { color: theme.text }]}>{member.name}</Text>
                <Text style={[styles.memberRole, { color: theme.textMuted }]}>{member.role}</Text>
              </View>
              {member.id === snapshot.household.shopperOfWeekMemberId ? (
                <View
                  style={[
                    styles.roleTag,
                    {
                      backgroundColor: theme.accentSoft,
                      borderColor: theme.border,
                    },
                  ]}>
                  <Text style={[styles.roleTagText, { color: theme.text }]}>Shopper</Text>
                </View>
              ) : null}
            </View>
          );
        })}
      </SectionCard>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  metricGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.three,
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.four,
  },
  summaryBlock: {
    flexBasis: 220,
    flexGrow: 1,
    gap: Spacing.one,
  },
  summaryLabel: {
    fontFamily: Fonts.sans,
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  summaryValue: {
    fontFamily: Fonts.rounded,
    fontSize: 24,
    fontWeight: '800',
  },
  progressTrack: {
    height: 14,
    borderRadius: Radii.pill,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: Radii.pill,
  },
  supportText: {
    fontFamily: Fonts.sans,
    fontSize: 14,
    lineHeight: 22,
  },
  inviteBox: {
    borderWidth: 1,
    borderRadius: Radii.medium,
    padding: Spacing.three,
    gap: Spacing.one,
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
  textArea: {
    minHeight: 96,
    borderWidth: 1,
    borderRadius: Radii.medium,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
    fontFamily: Fonts.sans,
    fontSize: 16,
    textAlignVertical: 'top',
  },
  inviteCode: {
    fontFamily: Fonts.mono,
    fontSize: 20,
    fontWeight: '700',
  },
  inviteCopy: {
    fontFamily: Fonts.sans,
    fontSize: 14,
    lineHeight: 22,
  },
  actionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  securityStatus: {
    borderWidth: 1,
    borderRadius: Radii.medium,
    padding: Spacing.three,
    gap: Spacing.one,
  },
  securityStatusTitle: {
    fontFamily: Fonts.sans,
    fontSize: 13,
    fontWeight: '800',
  },
  securityStatusCopy: {
    fontFamily: Fonts.sans,
    fontSize: 14,
    lineHeight: 22,
  },
  rowWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  listActionColumn: {
    width: 150,
    gap: Spacing.two,
  },
  inlineActionBlock: {
    minWidth: 160,
    justifyContent: 'flex-end',
  },
  spendMixRow: {
    borderWidth: 1,
    borderRadius: Radii.medium,
    padding: Spacing.three,
    gap: Spacing.two,
  },
  spendMixCopy: {
    gap: Spacing.two,
  },
  spendMixHeading: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: Spacing.three,
  },
  spendMixAmount: {
    fontFamily: Fonts.rounded,
    fontSize: 18,
    fontWeight: '800',
  },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    borderWidth: 1,
    borderRadius: Radii.medium,
    padding: Spacing.three,
  },
  memberBadge: {
    width: 44,
    height: 44,
    borderWidth: 1,
    borderRadius: Radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  memberBadgeText: {
    fontFamily: Fonts.sans,
    fontSize: 14,
    fontWeight: '800',
  },
  memberCopy: {
    flex: 1,
    gap: 2,
  },
  memberName: {
    fontFamily: Fonts.sans,
    fontSize: 16,
    fontWeight: '800',
  },
  memberRole: {
    fontFamily: Fonts.sans,
    fontSize: 13,
  },
  roleTag: {
    borderWidth: 1,
    borderRadius: Radii.pill,
    paddingHorizontal: Spacing.two,
    paddingVertical: 6,
  },
  roleTagText: {
    fontFamily: Fonts.sans,
    fontSize: 12,
    fontWeight: '800',
  },
  emptyMessage: {
    fontFamily: Fonts.sans,
    fontSize: 15,
    lineHeight: 22,
  },
});
