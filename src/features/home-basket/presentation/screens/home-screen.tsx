import { Link } from 'expo-router';
import React from 'react';
import {
  Keyboard,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { Fonts, Radii, Spacing } from '@/constants/theme';
import {
  ShoppingCategory,
  shoppingCategories,
  shoppingFilters,
} from '@/features/home-basket/domain/models';
import { buildHomeScreenModel } from '@/features/home-basket/presentation/selectors';
import { useHomeBasketStore } from '@/features/home-basket/presentation/use-home-basket-store';
import { useTheme } from '@/hooks/use-theme';
import { formatCurrency } from '@/shared/format/currency';
import { formatLongDate, formatShortDate } from '@/shared/format/date';
import {
  ActionButton,
  MessageBanner,
  MetricCard,
  PillButton,
  ScreenShell,
  SectionCard,
} from '@/shared/ui';

function formatReminderCadence(cadence: string) {
  switch (cadence) {
    case 'fortnightly':
      return 'Every 2 weeks';
    case 'monthly':
      return 'Every month';
    default:
      return 'Every week';
  }
}

function describeReminderDueDate(nextDueAt: string) {
  const today = new Date();
  const dueDate = new Date(nextDueAt);
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const dueStart = new Date(dueDate.getFullYear(), dueDate.getMonth(), dueDate.getDate());
  const diffDays = Math.round((dueStart.getTime() - todayStart.getTime()) / (24 * 60 * 60 * 1000));

  if (diffDays < 0) {
    return `Overdue since ${formatShortDate(nextDueAt)}`;
  }

  if (diffDays === 0) {
    return 'Due today';
  }

  if (diffDays === 1) {
    return 'Due tomorrow';
  }

  return `Due ${formatLongDate(nextDueAt)}`;
}

export default function HomeScreen() {
  const theme = useTheme();
  const snapshot = useHomeBasketStore((state) => state.snapshot);
  const isReady = useHomeBasketStore((state) => state.isReady);
  const isSaving = useHomeBasketStore((state) => state.isSaving);
  const error = useHomeBasketStore((state) => state.error);
  const notice = useHomeBasketStore((state) => state.notice);
  const filter = useHomeBasketStore((state) => state.filter);
  const selectedMemberId = useHomeBasketStore((state) => state.selectedMemberId);
  const editingItemId = useHomeBasketStore((state) => state.editingItemId);
  const addItemDraft = useHomeBasketStore((state) => state.addItemDraft);
  const itemEditDraft = useHomeBasketStore((state) => state.itemEditDraft);
  const setFilter = useHomeBasketStore((state) => state.setFilter);
  const setSelectedMember = useHomeBasketStore((state) => state.setSelectedMember);
  const updateAddItemDraft = useHomeBasketStore((state) => state.updateAddItemDraft);
  const startEditingItem = useHomeBasketStore((state) => state.startEditingItem);
  const cancelEditingItem = useHomeBasketStore((state) => state.cancelEditingItem);
  const updateItemEditDraft = useHomeBasketStore((state) => state.updateItemEditDraft);
  const addSuggestedItem = useHomeBasketStore((state) => state.addSuggestedItem);
  const addItem = useHomeBasketStore((state) => state.addItem);
  const saveItemEdits = useHomeBasketStore((state) => state.saveItemEdits);
  const deleteItem = useHomeBasketStore((state) => state.deleteItem);
  const toggleItemStatus = useHomeBasketStore((state) => state.toggleItemStatus);
  const addReminderToBasket = useHomeBasketStore((state) => state.addReminderToBasket);
  const addItemNameInputRef = React.useRef<TextInput | null>(null);
  const addItemQuantityInputRef = React.useRef<TextInput | null>(null);
  const addItemCustomCategoryInputRef = React.useRef<TextInput | null>(null);

  const dismissAddItemFocus = React.useCallback(() => {
    addItemNameInputRef.current?.blur();
    addItemQuantityInputRef.current?.blur();
    addItemCustomCategoryInputRef.current?.blur();
    Keyboard.dismiss();
  }, []);

  const handleSetFilter = React.useCallback(
    (nextFilter: (typeof shoppingFilters)[number]) => {
      dismissAddItemFocus();
      setFilter(nextFilter);
    },
    [dismissAddItemFocus, setFilter]
  );

  const handleSetSelectedMember = React.useCallback(
    (memberId: string) => {
      dismissAddItemFocus();
      setSelectedMember(memberId);
    },
    [dismissAddItemFocus, setSelectedMember]
  );

  const handleStartEditingItem = React.useCallback(
    (itemId: string) => {
      dismissAddItemFocus();
      startEditingItem(itemId);
    },
    [dismissAddItemFocus, startEditingItem]
  );

  const handleSaveItemEdits = React.useCallback(() => {
    dismissAddItemFocus();
    void saveItemEdits();
  }, [dismissAddItemFocus, saveItemEdits]);

  const handleDeleteItem = React.useCallback(
    (itemId: string) => {
      dismissAddItemFocus();
      void deleteItem(itemId);
    },
    [deleteItem, dismissAddItemFocus]
  );

  const handleToggleItemStatus = React.useCallback(
    (itemId: string) => {
      dismissAddItemFocus();
      void toggleItemStatus(itemId);
    },
    [dismissAddItemFocus, toggleItemStatus]
  );

  const handleAddSuggestedItem = React.useCallback(
    (input: {
      name: string;
      quantity: string;
      category: ShoppingCategory;
    }) => {
      dismissAddItemFocus();
      void addSuggestedItem(input);
    },
    [addSuggestedItem, dismissAddItemFocus]
  );

  const handleAddReminderToBasket = React.useCallback(
    (reminderId: string) => {
      dismissAddItemFocus();
      void addReminderToBasket(reminderId);
    },
    [addReminderToBasket, dismissAddItemFocus]
  );

  const handleAddItem = React.useCallback(() => {
    dismissAddItemFocus();
    setFilter('all');
    void addItem();
  }, [addItem, dismissAddItemFocus, setFilter]);

  if (!snapshot) {
    return (
      <ScreenShell
        eyebrow="Shared household list"
        title="Home Basket"
        subtitle={
          isReady
            ? 'The household snapshot is temporarily unavailable.'
            : 'Loading your household list...'
        }>
        <SectionCard tone="muted">
          <Text style={[styles.emptyMessage, { color: theme.textMuted }]}>
            {isReady
              ? 'Try reloading the app to reconnect to the household data.'
              : 'Preparing the shopping list, purchase history, and household summary.'}
          </Text>
        </SectionCard>
      </ScreenShell>
    );
  }

  if (snapshot.members.length === 0) {
    return (
      <ScreenShell
        eyebrow="Shared household list"
        title={snapshot.household.name}
        subtitle="Connecting the household roster to the live basket...">
        <SectionCard tone="muted">
          <Text style={[styles.emptyMessage, { color: theme.textMuted }]}>
            Waiting for the household members to finish syncing.
          </Text>
        </SectionCard>
      </ScreenShell>
    );
  }

  const model = buildHomeScreenModel(snapshot, filter, selectedMemberId);
  const selectedMember = model.selectedMember;
  const hasBudget = snapshot.household.monthlyBudgetCents > 0;
  const hasBasketItems = snapshot.items.length > 0;
  const shouldFocusNotice =
    notice?.includes('added back to the basket') ||
    notice?.includes('already reflected on the active basket');

  const activeBasketSection = (
    <SectionCard
      title="Active basket"
      description="Use the filters to focus on pending or already-bought items.">
      <View style={styles.rowWrap}>
        {shoppingFilters.map((itemFilter) => (
          <PillButton
            key={itemFilter}
            label={itemFilter === 'all' ? 'All items' : itemFilter === 'pending' ? 'Pending' : 'Bought'}
            active={filter === itemFilter}
            onPress={() => handleSetFilter(itemFilter)}
          />
        ))}
      </View>

      {model.groupedItems.length === 0 ? (
        <Text style={[styles.emptyMessage, { color: theme.textMuted }]}>
          No items match this filter yet.
        </Text>
      ) : (
        model.groupedItems.map((group) => (
          <View key={group.category} style={styles.groupBlock}>
            <Text style={[styles.groupTitle, { color: theme.primaryStrong }]}>
              {group.category}
            </Text>

            {group.items.map((item) => {
              const addedBy = snapshot.members.find((member) => member.id === item.addedByMemberId);
              const isBought = item.status === 'bought';
              const isEditing = editingItemId === item.id;

              return (
                <View
                  key={item.id}
                  style={[
                    styles.itemRow,
                    {
                      backgroundColor: isBought ? theme.primarySoft : theme.surface,
                      borderColor: theme.border,
                    },
                  ]}>
                  <View style={styles.itemCopy}>
                    {isEditing ? (
                      <View style={styles.editForm}>
                        <View style={styles.formGrid}>
                          <View style={styles.gridFieldBlock}>
                            <Text style={[styles.fieldLabel, { color: theme.textMuted }]}>
                              Item name
                            </Text>
                            <TextInput
                              value={itemEditDraft.name}
                              onChangeText={(name) => updateItemEditDraft({ name })}
                              placeholder="Milk, bread..."
                              placeholderTextColor={theme.textMuted}
                              style={[
                                styles.input,
                                {
                                  backgroundColor: theme.surfaceMuted,
                                  borderColor: theme.border,
                                  color: theme.text,
                                },
                              ]}
                            />
                          </View>
                          <View style={styles.gridFieldBlock}>
                            <Text style={[styles.fieldLabel, { color: theme.textMuted }]}>
                              Quantity
                            </Text>
                            <TextInput
                              value={itemEditDraft.quantity}
                              onChangeText={(quantity) => updateItemEditDraft({ quantity })}
                              placeholder="1 pack"
                              placeholderTextColor={theme.textMuted}
                              style={[
                                styles.input,
                                {
                                  backgroundColor: theme.surfaceMuted,
                                  borderColor: theme.border,
                                  color: theme.text,
                                },
                              ]}
                            />
                          </View>
                          <View style={styles.gridFieldBlock}>
                            <Text style={[styles.fieldLabel, { color: theme.textMuted }]}>
                              Category
                            </Text>
                            <TextInput
                              value={itemEditDraft.category}
                              onChangeText={(category) => updateItemEditDraft({ category })}
                              placeholder="Produce, Pantry, Gardening..."
                              placeholderTextColor={theme.textMuted}
                              style={[
                                styles.input,
                                {
                                  backgroundColor: theme.surfaceMuted,
                                  borderColor: theme.border,
                                  color: theme.text,
                                },
                              ]}
                            />
                          </View>
                        </View>
                        <Text style={[styles.itemMeta, { color: theme.textMuted }]}>
                          Added by {addedBy?.name ?? 'Unknown'} on {formatShortDate(item.addedAt)}
                        </Text>
                      </View>
                    ) : (
                      <>
                        <View style={styles.itemHeading}>
                          <Text style={[styles.itemName, { color: theme.text }]}>{item.name}</Text>
                          <View
                            style={[
                              styles.statusPill,
                              {
                                backgroundColor: isBought ? theme.primary : theme.surfaceMuted,
                                borderColor: theme.border,
                              },
                            ]}>
                            <Text
                              style={[
                                styles.statusLabel,
                                { color: isBought ? '#FFFFFF' : theme.textMuted },
                              ]}>
                              {isBought ? 'Bought' : 'Pending'}
                            </Text>
                          </View>
                        </View>
                        <View style={styles.itemDetailsRow}>
                          <Text
                            style={[
                              styles.itemQuantityLabel,
                              {
                                backgroundColor: theme.surfaceMuted,
                                borderColor: theme.border,
                                color: theme.text,
                              },
                            ]}>
                            Qty {item.quantity}
                          </Text>
                          <Text style={[styles.itemMeta, { color: theme.textMuted }]}>
                            Added by {addedBy?.name ?? 'Unknown'} on {formatShortDate(item.addedAt)}
                          </Text>
                        </View>
                      </>
                    )}
                  </View>
                  <View style={styles.listActionColumn}>
                    {isEditing ? (
                      <>
                        <ActionButton
                          label="Save"
                          onPress={handleSaveItemEdits}
                          disabled={isSaving}
                        />
                        <ActionButton
                          label="Cancel"
                          tone="secondary"
                          onPress={cancelEditingItem}
                          disabled={isSaving}
                        />
                        <ActionButton
                          label="Remove"
                          tone="secondary"
                          onPress={() => handleDeleteItem(item.id)}
                          disabled={isSaving}
                        />
                      </>
                    ) : (
                      <>
                        <ActionButton
                          label={isBought ? 'Undo' : 'Mark bought'}
                          tone={isBought ? 'secondary' : 'primary'}
                          onPress={() => handleToggleItemStatus(item.id)}
                          disabled={isSaving}
                        />
                        <ActionButton
                          label="Edit"
                          tone="secondary"
                          onPress={() => handleStartEditingItem(item.id)}
                          disabled={isSaving}
                        />
                      </>
                    )}
                  </View>
                </View>
              );
            })}
          </View>
        ))
      )}
    </SectionCard>
  );

  const addItemSection = (
    <SectionCard
      title="Add something fast"
      description="The acting member is who the app credits for new shopping items.">
      <View style={styles.rowWrap}>
        {snapshot.members.map((member) => (
          <PillButton
            key={member.id}
            label={member.name}
            active={member.id === selectedMember.id}
            onPress={() => handleSetSelectedMember(member.id)}
          />
        ))}
      </View>

      <View style={styles.formGrid}>
        <View style={styles.gridFieldBlock}>
          <Text style={[styles.fieldLabel, { color: theme.textMuted }]}>Item name</Text>
          <TextInput
            ref={addItemNameInputRef}
            value={addItemDraft.name}
            onChangeText={(name) => updateAddItemDraft({ name })}
            placeholder="Milk, rice, toothpaste..."
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
            ref={addItemQuantityInputRef}
            value={addItemDraft.quantity}
            onChangeText={(quantity) => updateAddItemDraft({ quantity })}
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
      </View>

      <View style={styles.fieldBlock}>
        <Text style={[styles.fieldLabel, { color: theme.textMuted }]}>Category</Text>
        <View style={styles.rowWrap}>
          {shoppingCategories.map((category) => (
            <PillButton
              key={category}
              label={category}
              active={addItemDraft.category === category}
              onPress={() => updateAddItemDraft({ category, customCategory: '' })}
            />
          ))}
        </View>
      </View>

      <View style={styles.fieldBlock}>
        <Text style={[styles.fieldLabel, { color: theme.textMuted }]}>
          Custom category
        </Text>
        <TextInput
          ref={addItemCustomCategoryInputRef}
          value={addItemDraft.customCategory}
          onChangeText={(customCategory) => updateAddItemDraft({ customCategory })}
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
        <Text style={[styles.emptyMessage, { color: theme.textMuted }]}>
          Leave this blank to use the selected category above. New categories appear as their own
          section headers in Active basket.
        </Text>
      </View>

      <ActionButton
        label={`Add as ${selectedMember.name}`}
        onPress={handleAddItem}
        disabled={isSaving || !addItemDraft.name.trim()}
      />
    </SectionCard>
  );

  return (
    <ScreenShell
      eyebrow="Shared household list"
      title={snapshot.household.name}
      swipeNavigationEnabled
      scrollToTopSignal={shouldFocusNotice ? notice : null}
      subtitle="Add items, mark them bought, and close them into purchase history when ready.">
      <View style={styles.metricGrid}>
        <MetricCard
          label="Still to buy"
          value={String(model.dashboard.pendingItemsCount)}
          helper="Items staying on the active list"
          tone="primary"
        />
        <MetricCard
          label="Ready to close"
          value={String(model.dashboard.boughtItemsCount)}
          helper="Bought items waiting for purchase logging"
        />
        <MetricCard
          label={hasBudget ? 'Budget left' : 'Monthly budget'}
          value={
            hasBudget
              ? formatCurrency(
                  model.dashboard.budgetRemainingCents,
                  snapshot.household.currencyCode
                )
              : 'Not set'
          }
          helper={hasBudget ? 'Remaining in this cycle' : 'Optional until you turn it on'}
          tone="accent"
        />
      </View>

      {error ? <MessageBanner message={error} tone="error" /> : null}
      {!error && notice ? <MessageBanner message={notice} /> : null}

      {model.dashboard.boughtItemsCount > 0 ? (
        <SectionCard
          title={`${model.dashboard.boughtItemsCount} items are ready for checkout`}
          description="Bought items clear from the shared list only after you record the purchase total."
          tone="accent">
          <Link href="/purchases" asChild>
            <Pressable
              style={({ pressed }) => [
                styles.tripLink,
                {
                  backgroundColor: theme.primary,
                  opacity: pressed ? 0.88 : 1,
                },
              ]}>
              <Text style={styles.tripLinkText}>Open purchases</Text>
            </Pressable>
          </Link>
        </SectionCard>
      ) : null}

      {model.dueReminders.length > 0 ? (
        <SectionCard
          title="Upcoming reminders"
          description="Shared nudges for the staples this household buys on a rhythm. Add them back to the basket when the time comes.">
          <View style={styles.suggestionGrid}>
            {model.dueReminders.map((reminder) => (
              <View
                key={reminder.id}
                style={[
                  styles.suggestionCard,
                  {
                    backgroundColor: theme.surface,
                    borderColor: theme.border,
                  },
                ]}>
                <View style={styles.suggestionCopy}>
                  <Text style={[styles.suggestionName, { color: theme.text }]}>
                    {reminder.title}
                  </Text>
                  <Text style={[styles.suggestionMeta, { color: theme.textMuted }]}>
                    {reminder.quantity} - {formatReminderCadence(reminder.cadence)} - {describeReminderDueDate(reminder.nextDueAt)}
                  </Text>
                  {reminder.note ? (
                    <Text style={[styles.suggestionMeta, { color: theme.textMuted }]}>
                      {reminder.note}
                    </Text>
                  ) : null}
                </View>
                <ActionButton
                  label={`Add as ${selectedMember.name}`}
                  tone="secondary"
                  onPress={() => handleAddReminderToBasket(reminder.id)}
                />
              </View>
            ))}
          </View>
        </SectionCard>
      ) : null}

      {model.suggestions.length > 0 ? (
        <SectionCard
          title="Recurring staples"
          description="Home Basket is learning the things this household buys often, so you can re-add them in one tap.">
          <View style={styles.suggestionGrid}>
            {model.suggestions.map((suggestion) => (
              <View
                key={suggestion.key}
                style={[
                  styles.suggestionCard,
                  {
                    backgroundColor: theme.surface,
                    borderColor: theme.border,
                  },
                ]}>
                <View style={styles.suggestionCopy}>
                  <Text style={[styles.suggestionName, { color: theme.text }]}>
                    {suggestion.name}
                  </Text>
                  <Text style={[styles.suggestionMeta, { color: theme.textMuted }]}>
                    {suggestion.quantity} - bought {suggestion.timesPurchased} time
                    {suggestion.timesPurchased === 1 ? '' : 's'} - last {formatShortDate(suggestion.lastPurchasedAt)}
                  </Text>
                </View>
                <ActionButton
                  label="Add back"
                  tone="secondary"
                  onPress={() =>
                    handleAddSuggestedItem({
                      name: suggestion.name,
                      quantity: suggestion.quantity,
                      category: suggestion.category,
                    })
                  }
                />
              </View>
            ))}
          </View>
        </SectionCard>
      ) : null}

      {hasBasketItems ? (
        <>
          {activeBasketSection}
          {addItemSection}
        </>
      ) : (
        addItemSection
      )}
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  metricGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.three,
  },
  tripLink: {
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
    borderRadius: Radii.pill,
  },
  tripLinkText: {
    fontFamily: Fonts.sans,
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  suggestionGrid: {
    gap: Spacing.three,
  },
  suggestionCard: {
    borderWidth: 1,
    borderRadius: Radii.medium,
    padding: Spacing.three,
    gap: Spacing.three,
  },
  suggestionCopy: {
    gap: Spacing.one,
  },
  suggestionName: {
    fontFamily: Fonts.sans,
    fontSize: 17,
    fontWeight: '800',
  },
  suggestionMeta: {
    fontFamily: Fonts.sans,
    fontSize: 13,
    lineHeight: 20,
  },
  rowWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
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
  emptyMessage: {
    fontFamily: Fonts.sans,
    fontSize: 15,
    lineHeight: 22,
  },
  groupBlock: {
    gap: Spacing.three,
  },
  groupTitle: {
    fontFamily: Fonts.sans,
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.9,
    textTransform: 'uppercase',
  },
  itemRow: {
    borderWidth: 1,
    borderRadius: Radii.medium,
    padding: Spacing.three,
    gap: Spacing.three,
  },
  itemCopy: {
    gap: Spacing.one,
  },
  editForm: {
    gap: Spacing.two,
  },
  itemHeading: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: Spacing.two,
  },
  itemName: {
    fontFamily: Fonts.sans,
    fontSize: 17,
    fontWeight: '800',
  },
  itemMeta: {
    fontFamily: Fonts.sans,
    fontSize: 13,
  },
  itemDetailsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: Spacing.two,
  },
  itemQuantityLabel: {
    overflow: 'hidden',
    borderWidth: 1,
    borderRadius: Radii.pill,
    paddingHorizontal: Spacing.two,
    paddingVertical: 4,
    fontFamily: Fonts.sans,
    fontSize: 12,
    fontWeight: '800',
  },
  listActionColumn: {
    width: 150,
    gap: Spacing.two,
  },
  statusPill: {
    borderWidth: 1,
    borderRadius: Radii.pill,
    paddingHorizontal: Spacing.two,
    paddingVertical: 6,
  },
  statusLabel: {
    fontFamily: Fonts.sans,
    fontSize: 12,
    fontWeight: '800',
  },
});
