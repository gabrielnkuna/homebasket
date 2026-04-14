import { Link, useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import {
  InteractionManager,
  Keyboard,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { Fonts, Radii, Spacing } from '@/constants/theme';
import { resolveShoppingCategory } from '@/features/home-basket/application/resolve-shopping-category';
import {
  ShoppingCategory,
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

type LastAddedItemConfirmation = {
  name: string;
  quantity: string;
  category: string;
};

type HomeScrollTarget = 'active-basket' | 'just-added';

export default function HomeScreen() {
  const theme = useTheme();
  const router = useRouter();
  const searchParams = useLocalSearchParams<{ addItem?: string | string[] }>();
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
  const addItemSectionRef = React.useRef<View | null>(null);
  const activeBasketSectionRef = React.useRef<View | null>(null);
  const justAddedItemRef = React.useRef<View | null>(null);
  const lastScrolledJustAddedItemIdRef = React.useRef<string | null>(null);
  const scheduledAddItemFocusCleanupRef = React.useRef<(() => void) | null>(null);
  const [areRecurringStaplesExpanded, setAreRecurringStaplesExpanded] = React.useState(false);
  const [lastAddedItemConfirmation, setLastAddedItemConfirmation] =
    React.useState<LastAddedItemConfirmation | null>(null);
  const [scrollTarget, setScrollTarget] = React.useState<{
    signal: number;
    target: HomeScrollTarget;
  } | null>(null);
  const addItemRequest = Array.isArray(searchParams.addItem)
    ? searchParams.addItem[0]
    : searchParams.addItem;
  const snapshotHouseholdId = snapshot?.household.id ?? null;
  const snapshotMemberCount = snapshot?.members.length ?? 0;
  const lastAddedActiveItem = React.useMemo(() => {
    if (!snapshot || !lastAddedItemConfirmation) {
      return null;
    }

    return [...snapshot.items]
      .reverse()
      .find(
        (item) =>
          item.name === lastAddedItemConfirmation.name &&
          item.quantity === lastAddedItemConfirmation.quantity &&
          item.category === lastAddedItemConfirmation.category
      ) ?? null;
  }, [lastAddedItemConfirmation, snapshot]);

  const dismissAddItemFocus = React.useCallback(() => {
    addItemNameInputRef.current?.blur();
    addItemQuantityInputRef.current?.blur();
    addItemCustomCategoryInputRef.current?.blur();
    Keyboard.dismiss();
  }, []);

  const scheduleAddItemNameFocus = React.useCallback((initialDelayMs = 0) => {
    scheduledAddItemFocusCleanupRef.current?.();

    if (Platform.OS === 'web') {
      const frame = requestAnimationFrame(() => {
        addItemNameInputRef.current?.focus();
      });

      scheduledAddItemFocusCleanupRef.current = () => cancelAnimationFrame(frame);
      return;
    }

    const timers: ReturnType<typeof setTimeout>[] = [];
    const interactionTasks: { cancel?: () => void }[] = [];
    const retryDelays = [initialDelayMs, initialDelayMs + 180, initialDelayMs + 420];

    retryDelays.forEach((delay) => {
      const timer = setTimeout(() => {
        const interactionTask = InteractionManager.runAfterInteractions(() => {
          requestAnimationFrame(() => {
            addItemNameInputRef.current?.focus();
          });
        });
        interactionTasks.push(interactionTask);
      }, delay);
      timers.push(timer);
    });

    scheduledAddItemFocusCleanupRef.current = () => {
      timers.forEach(clearTimeout);
      interactionTasks.forEach((task) => task.cancel?.());
    };
  }, []);

  const requestScrollToActiveBasket = React.useCallback(() => {
    setScrollTarget({ signal: Date.now(), target: 'active-basket' });
  }, []);

  const requestScrollToJustAddedItem = React.useCallback(() => {
    setScrollTarget({ signal: Date.now(), target: 'just-added' });
  }, []);

  React.useEffect(
    () => () => {
      scheduledAddItemFocusCleanupRef.current?.();
    },
    []
  );

  React.useEffect(() => {
    if (!lastAddedActiveItem?.id) {
      return;
    }

    if (lastScrolledJustAddedItemIdRef.current === lastAddedActiveItem.id) {
      return;
    }

    lastScrolledJustAddedItemIdRef.current = lastAddedActiveItem.id;
    requestScrollToJustAddedItem();
  }, [lastAddedActiveItem?.id, requestScrollToJustAddedItem]);

  React.useEffect(() => {
    const itemWasRemoved = notice?.includes('removed from the basket');

    if (lastAddedItemConfirmation && itemWasRemoved && !lastAddedActiveItem) {
      setLastAddedItemConfirmation(null);
      lastScrolledJustAddedItemIdRef.current = null;
    }
  }, [lastAddedActiveItem, lastAddedItemConfirmation, notice]);

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
      if (lastAddedActiveItem?.id === itemId) {
        setLastAddedItemConfirmation(null);
        lastScrolledJustAddedItemIdRef.current = null;
      }

      dismissAddItemFocus();
      void deleteItem(itemId);
    },
    [deleteItem, dismissAddItemFocus, lastAddedActiveItem?.id]
  );

  const handleToggleItemStatus = React.useCallback(
    (itemId: string) => {
      if (lastAddedActiveItem?.id === itemId) {
        setLastAddedItemConfirmation(null);
        lastScrolledJustAddedItemIdRef.current = null;
      }

      dismissAddItemFocus();
      void toggleItemStatus(itemId);
    },
    [dismissAddItemFocus, lastAddedActiveItem?.id, toggleItemStatus]
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

  const handleAddItem = React.useCallback(async () => {
    const itemToConfirm = {
      name: addItemDraft.name.trim(),
      quantity: addItemDraft.quantity.trim() || '1',
      category: resolveShoppingCategory(addItemDraft.category, addItemDraft.customCategory),
    };

    dismissAddItemFocus();
    setFilter('all');
    await addItem();

    const latestState = useHomeBasketStore.getState();

    if (!latestState.error && itemToConfirm.name) {
      lastScrolledJustAddedItemIdRef.current = null;
      setLastAddedItemConfirmation(itemToConfirm);
    }
  }, [
    addItem,
    addItemDraft.category,
    addItemDraft.customCategory,
    addItemDraft.name,
    addItemDraft.quantity,
    dismissAddItemFocus,
    setFilter,
  ]);

  const handleOpenPendingItems = React.useCallback(() => {
    dismissAddItemFocus();
    setFilter('pending');
    requestScrollToActiveBasket();
  }, [dismissAddItemFocus, requestScrollToActiveBasket, setFilter]);

  const handleOpenReadyItems = React.useCallback(() => {
    dismissAddItemFocus();

    if (lastAddedItemConfirmation) {
      setLastAddedItemConfirmation(null);
      lastScrolledJustAddedItemIdRef.current = null;
    }

    if (snapshot?.items.some((item) => item.status === 'bought')) {
      setFilter('bought');
      requestScrollToActiveBasket();
      return;
    }

    router.navigate('/purchases');
  }, [
    dismissAddItemFocus,
    lastAddedItemConfirmation,
    requestScrollToActiveBasket,
    router,
    setFilter,
    snapshot?.items,
  ]);

  const handleOpenBudgetSettings = React.useCallback(() => {
    dismissAddItemFocus();
    router.navigate('/household');
  }, [dismissAddItemFocus, router]);

  const handleOpenAddItemComposer = React.useCallback(() => {
    setFilter('all');
    scheduleAddItemNameFocus(Platform.OS === 'web' ? 0 : 120);
  }, [scheduleAddItemNameFocus, setFilter]);

  React.useEffect(() => {
    if (!addItemRequest || !snapshotHouseholdId || snapshotMemberCount === 0) {
      return;
    }

    const timeout = setTimeout(() => {
      setFilter('all');
      scheduleAddItemNameFocus(Platform.OS === 'web' ? 0 : 520);
    }, Platform.OS === 'web' ? 120 : 260);

    return () => clearTimeout(timeout);
  }, [
    addItemRequest,
    scheduleAddItemNameFocus,
    setFilter,
    snapshotHouseholdId,
    snapshotMemberCount,
  ]);

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
  const recurringStaplePreviewLimit = 2;
  const shouldPreviewRecurringStaples = !hasBasketItems || areRecurringStaplesExpanded;
  const visibleRecurringStaples = shouldPreviewRecurringStaples
    ? model.suggestions.slice(
        0,
        areRecurringStaplesExpanded ? model.suggestions.length : recurringStaplePreviewLimit
      )
    : [];
  const hasHiddenRecurringStaples = model.suggestions.length > visibleRecurringStaples.length;
  const canToggleRecurringStaples =
    hasBasketItems ||
    areRecurringStaplesExpanded ||
    model.suggestions.length > recurringStaplePreviewLimit;
  const recurringStaplesToggleLabel = !shouldPreviewRecurringStaples
    ? `Show staples (${model.suggestions.length})`
    : areRecurringStaplesExpanded
      ? 'Show less'
      : hasHiddenRecurringStaples
        ? `Show all ${model.suggestions.length}`
        : 'Hide staples';
  const recurringStaplesDescription = shouldPreviewRecurringStaples
    ? 'Home Basket is learning the things this household buys often, so you can re-add them in one tap.'
    : 'Collapsed so the active basket stays easy to reach. Open it when you want quick re-add ideas.';
  const shouldFocusNotice =
    notice?.includes('added back to the basket') ||
    notice?.includes('already reflected on the active basket');
  const screenScrollTargetRef =
    scrollTarget?.target === 'just-added' ? justAddedItemRef : activeBasketSectionRef;

  const activeBasketSection = (
    <View ref={activeBasketSectionRef} collapsable={false}>
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
                const isJustAdded = lastAddedActiveItem?.id === item.id;

                return (
                  <View
                    key={item.id}
                    ref={isJustAdded ? justAddedItemRef : undefined}
                    collapsable={!isJustAdded}
                    style={[
                      styles.itemRow,
                      {
                        backgroundColor: isBought ? theme.primarySoft : theme.accentSoft,
                        borderColor: isJustAdded ? theme.accent : theme.border,
                      },
                      isJustAdded ? styles.justAddedItemRow : null,
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
                              placeholder="Choose below or type a category..."
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
                            <View style={styles.rowWrap}>
                              {model.categoryOptions.map((category) => (
                                <PillButton
                                  key={category}
                                  label={category}
                                  active={itemEditDraft.category === category}
                                  onPress={() => updateItemEditDraft({ category })}
                                />
                              ))}
                            </View>
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
                          {isJustAdded ? (
                            <Text
                              style={[
                                styles.justAddedPill,
                                {
                                  backgroundColor: theme.accentSoft,
                                  borderColor: theme.accent,
                                  color: theme.text,
                                },
                              ]}>
                              Just added
                            </Text>
                          ) : null}
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
    </View>
  );

  const addItemSection = (
    <View ref={addItemSectionRef} collapsable={false}>
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
            {model.categoryOptions.map((category) => (
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
    </View>
  );

  const dueRemindersSection = model.dueReminders.length > 0 ? (
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
  ) : null;

  const recurringStaplesSection = model.suggestions.length > 0 ? (
    <SectionCard title="Recurring staples" description={recurringStaplesDescription}>
      {visibleRecurringStaples.length > 0 ? (
        <View style={styles.suggestionGrid}>
          {visibleRecurringStaples.map((suggestion) => (
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
      ) : (
        <Text style={[styles.emptyMessage, { color: theme.textMuted }]}>
          {model.suggestions.length === 1
            ? '1 staple suggestion is tucked away so your active list stays close.'
            : `${model.suggestions.length} staple suggestions are tucked away so your active list stays close.`}
        </Text>
      )}

      {canToggleRecurringStaples ? (
        <View style={styles.compactAction}>
          <ActionButton
            label={recurringStaplesToggleLabel}
            tone="secondary"
            onPress={() => setAreRecurringStaplesExpanded((expanded) => !expanded)}
          />
        </View>
      ) : null}
    </SectionCard>
  ) : null;

  return (
    <ScreenShell
      eyebrow="Shared household list"
      title={snapshot.household.name}
      swipeNavigationEnabled
      scrollToTopSignal={shouldFocusNotice ? notice : null}
      scrollTargetOffset={Platform.OS === 'web' ? Spacing.four : 96}
      scrollTargetRef={screenScrollTargetRef}
      scrollToTargetSignal={scrollTarget?.signal ?? null}
      scrollToBottomSignal={addItemRequest ?? null}
      floatingAction={{
        accessibilityLabel: 'Add shopping item',
        accessibilityHint: 'Jumps to the add item form.',
        label: 'Add item',
        onPress: handleOpenAddItemComposer,
        scrollTargetOffset: Platform.OS === 'web' ? Spacing.four : 92,
        scrollTargetRef: addItemSectionRef,
        scrollTo: hasBasketItems ? 'bottom' : undefined,
      }}
      subtitle="Add items, mark them bought, and close them into purchase history when ready.">
      <View style={styles.metricGrid}>
        <MetricCard
          label="Still to buy"
          value={String(model.dashboard.pendingItemsCount)}
          helper="Items staying on the active list"
          accessibilityHint={
            model.dashboard.pendingItemsCount > 0
              ? 'Shows pending items in the active basket.'
              : undefined
          }
          onPress={model.dashboard.pendingItemsCount > 0 ? handleOpenPendingItems : undefined}
          tone="primary"
        />
        <MetricCard
          label="Ready to close"
          value={String(model.dashboard.boughtItemsCount)}
          helper="Bought items waiting for purchase logging"
          accessibilityHint={
            model.dashboard.boughtItemsCount > 0
              ? 'Shows bought items waiting to be recorded.'
              : undefined
          }
          onPress={model.dashboard.boughtItemsCount > 0 ? handleOpenReadyItems : undefined}
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
          accessibilityHint={hasBudget ? 'Opens household budget settings.' : undefined}
          onPress={hasBudget ? handleOpenBudgetSettings : undefined}
          tone="accent"
        />
      </View>

      {error ? <MessageBanner message={error} tone="error" /> : null}
      {!error && notice ? <MessageBanner message={notice} /> : null}

      {lastAddedActiveItem ? (
        <SectionCard
          title="Added to active basket"
          description="The item is saved and highlighted below in the active basket."
          tone="accent">
          <View
            style={[
              styles.justAddedCard,
              {
                backgroundColor: theme.surface,
                borderColor: theme.border,
              },
            ]}>
            <View style={styles.suggestionCopy}>
              <Text style={[styles.suggestionName, { color: theme.text }]}>
                {lastAddedActiveItem.name}
              </Text>
              <Text style={[styles.suggestionMeta, { color: theme.textMuted }]}>
                Qty {lastAddedActiveItem.quantity} - {lastAddedActiveItem.category}
              </Text>
            </View>
            <ActionButton
              label="Add another"
              tone="secondary"
              onPress={handleOpenAddItemComposer}
              disabled={isSaving}
            />
          </View>
        </SectionCard>
      ) : null}

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

      {hasBasketItems ? (
        <>
          {activeBasketSection}
          {dueRemindersSection}
          {recurringStaplesSection}
          {addItemSection}
        </>
      ) : (
        <>
          {addItemSection}
          {dueRemindersSection}
          {recurringStaplesSection}
        </>
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
  compactAction: {
    alignSelf: 'flex-start',
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
  justAddedItemRow: {
    borderWidth: 2,
  },
  justAddedCard: {
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
  justAddedPill: {
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
