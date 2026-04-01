import React from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { Image } from 'expo-image';
import * as Linking from 'expo-linking';

import { Fonts, Radii, Spacing } from '@/constants/theme';
import { buildTripPurchasedItems } from '@/features/home-basket/application/trip-purchased-items';
import { buildTripsScreenModel } from '@/features/home-basket/presentation/selectors';
import { useHomeBasketStore } from '@/features/home-basket/presentation/use-home-basket-store';
import { canAnalyzeReceipts } from '@/features/home-basket/infrastructure/receipt-analysis';
import {
  getAdvancedReceiptTranscriptionMessage,
  getReceiptAnalysisCapabilities,
} from '@/features/home-basket/infrastructure/receipt-analysis-capabilities';
import { useTheme } from '@/hooks/use-theme';
import { formatCurrency } from '@/shared/format/currency';
import { formatLongDate, formatShortDate } from '@/shared/format/date';
import {
  ActionButton,
  BrandBadge,
  MessageBanner,
  MetricCard,
  PillButton,
  ScreenShell,
  SectionCard,
} from '@/shared/ui';

export default function TripsScreen() {
  const theme = useTheme();
  const receiptAnalysisCapabilities = getReceiptAnalysisCapabilities({
    standardReadAvailable: canAnalyzeReceipts,
  });
  const snapshot = useHomeBasketStore((state) => state.snapshot);
  const selectedMemberId = useHomeBasketStore((state) => state.selectedMemberId);
  const setSelectedMember = useHomeBasketStore((state) => state.setSelectedMember);
  const tripDraft = useHomeBasketStore((state) => state.tripDraft);
  const updateTripDraft = useHomeBasketStore((state) => state.updateTripDraft);
  const addTripPurchasedItemDraft = useHomeBasketStore((state) => state.addTripPurchasedItemDraft);
  const updateTripPurchasedItemDraft = useHomeBasketStore((state) => state.updateTripPurchasedItemDraft);
  const removeTripPurchasedItemDraft = useHomeBasketStore((state) => state.removeTripPurchasedItemDraft);
  const applyReceiptDetectedItems = useHomeBasketStore((state) => state.applyReceiptDetectedItems);
  const addTripItemsBackToBasket = useHomeBasketStore((state) => state.addTripItemsBackToBasket);
  const completeTrip = useHomeBasketStore((state) => state.completeTrip);
  const pickTripReceipt = useHomeBasketStore((state) => state.pickTripReceipt);
  const analyzeTripReceipt = useHomeBasketStore((state) => state.analyzeTripReceipt);
  const clearTripReceipt = useHomeBasketStore((state) => state.clearTripReceipt);
  const isSaving = useHomeBasketStore((state) => state.isSaving);
  const isAnalyzingReceipt = useHomeBasketStore((state) => state.isAnalyzingReceipt);
  const error = useHomeBasketStore((state) => state.error);
  const notice = useHomeBasketStore((state) => state.notice);

  if (!snapshot) {
    return (
      <ScreenShell
        eyebrow="Purchases"
        title="Purchase history"
        subtitle="Loading the household purchase history...">
        <SectionCard tone="muted">
          <Text style={[styles.emptyMessage, { color: theme.textMuted }]}>
            Preparing recent receipts and spend history.
          </Text>
        </SectionCard>
      </ScreenShell>
    );
  }

  if (snapshot.members.length === 0) {
    return (
      <ScreenShell
        eyebrow="Purchases"
        title="Purchase history"
        subtitle="Connecting the household roster before purchase logging opens...">
        <SectionCard tone="muted">
          <Text style={[styles.emptyMessage, { color: theme.textMuted }]}>
            Waiting for the household members to finish syncing.
          </Text>
        </SectionCard>
      </ScreenShell>
    );
  }

  const model = buildTripsScreenModel(snapshot);
  const selectedMember =
    snapshot.members.find((member) => member.id === selectedMemberId) ?? snapshot.members[0];
  const finalTripItemsCount = buildTripPurchasedItems({
    boughtItems: model.readyItems.map((item) => ({
      id: item.id,
      name: item.name,
      category: item.category,
      quantity: item.quantity,
    })),
    reviewedItems: tripDraft.purchasedItemsDraft,
  }).length;

  return (
    <ScreenShell
      eyebrow="Purchases"
      title="Record a purchase"
      headerAccessory={<BrandBadge />}
      subtitle="Record what was bought once the order or checkout is done. Bought items move into history, and you can also log ad hoc purchases with a receipt even when nothing was pre-added to the list.">
      <View style={styles.metricGrid}>
        <MetricCard
          label="Cycle spend"
          value={formatCurrency(model.dashboard.budgetCycleSpendCents, snapshot.household.currencyCode)}
          helper={`Recorded in ${model.budgetCycleRangeLabel}`}
          tone="accent"
        />
        <MetricCard
          label="Average purchase"
          value={formatCurrency(model.averageTripSpendCents, snapshot.household.currencyCode)}
          helper="Across the recorded purchase history"
        />
        <MetricCard
          label="Ready items"
          value={String(model.readyItems.length)}
          helper="Bought items waiting to be cleared"
          tone="primary"
        />
        <MetricCard
          label="Receipt purchases"
          value={String(model.receiptTripCount)}
          helper="Past purchases with an attached receipt image"
        />
      </View>

      {error ? <MessageBanner message={error} tone="error" /> : null}
      {!error && notice ? <MessageBanner message={notice} /> : null}

      <SectionCard
        title="Record this purchase"
        description="Use the acting member flow here so each purchase stays linked to the shopper.">
        <View style={styles.rowWrap}>
          {snapshot.members.map((member) => (
            <PillButton
              key={member.id}
              label={member.name}
              active={member.id === selectedMember.id}
              onPress={() => setSelectedMember(member.id)}
            />
          ))}
        </View>

        <View style={styles.formGrid}>
          <View style={styles.fieldBlock}>
            <Text style={[styles.fieldLabel, { color: theme.textMuted }]}>Store or seller</Text>
            <TextInput
              value={tripDraft.store}
              onChangeText={(store) => updateTripDraft({ store })}
              placeholder={snapshot.household.primaryStore || 'Store, seller, app...'}
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
            <Text style={[styles.fieldLabel, { color: theme.textMuted }]}>Total spend</Text>
            <TextInput
              value={tripDraft.totalSpend}
              onChangeText={(totalSpend) => updateTripDraft({ totalSpend })}
              keyboardType="decimal-pad"
              placeholder={
                tripDraft.receiptPreviewUri
                  ? 'Optional if the receipt total is detected'
                  : '842.50'
              }
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
              {tripDraft.receiptPreviewUri
                ? 'Leave this blank if the uploaded slip is readable. Home Basket will use the detected total when it can.'
                : 'Enter the purchase total manually if you are not attaching a receipt.'}
            </Text>
          </View>
        </View>

        <View style={styles.fieldBlock}>
          <Text style={[styles.fieldLabel, { color: theme.textMuted }]}>Notes</Text>
          <TextInput
            value={tripDraft.note}
            onChangeText={(note) => updateTripDraft({ note })}
            multiline
            placeholder="Receipt filed, one item was out of stock..."
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

        <View style={styles.fieldBlock}>
          <Text style={[styles.fieldLabel, { color: theme.textMuted }]}>Receipt photo</Text>
          <View style={styles.actionRow}>
            <ActionButton
              label={tripDraft.receiptPreviewUri ? 'Replace receipt photo' : 'Attach receipt photo'}
              tone="secondary"
              onPress={() => void pickTripReceipt()}
              disabled={isSaving || isAnalyzingReceipt}
            />
            {tripDraft.receiptPreviewUri ? (
              <ActionButton
                label="Clear photo"
                tone="secondary"
                onPress={clearTripReceipt}
                disabled={isSaving || isAnalyzingReceipt}
              />
            ) : null}
            {tripDraft.receiptPreviewUri ? (
              <ActionButton
                label={isAnalyzingReceipt ? 'Reading receipt...' : 'Read receipt again'}
                tone="secondary"
                onPress={() => void analyzeTripReceipt()}
                disabled={isSaving || isAnalyzingReceipt}
              />
            ) : null}
          </View>
          {tripDraft.receiptPreviewUri ? (
            <View
              style={[
                styles.receiptPreviewCard,
                {
                  backgroundColor: theme.surface,
                  borderColor: theme.border,
                },
              ]}>
              <Image source={{ uri: tripDraft.receiptPreviewUri }} style={styles.receiptPreviewImage} />
              <View style={styles.receiptPreviewCopy}>
                <Text style={[styles.receiptPreviewTitle, { color: theme.text }]}>
                  {tripDraft.receiptFileName ?? 'Receipt ready'}
                </Text>
                <Text style={[styles.receiptPreviewMeta, { color: theme.textMuted }]}>
                  This image will upload with the purchase so the household can reopen the receipt later.
                </Text>
              </View>
            </View>
          ) : (
            <Text style={[styles.supportText, { color: theme.textMuted }]}>
              Optional, but useful when someone else in the household wants to check what was bought.
            </Text>
          )}
          <View
            style={[
              styles.receiptCapabilityCard,
              {
                backgroundColor: theme.surfaceMuted,
                borderColor: theme.border,
              },
            ]}>
            <Text style={[styles.receiptPreviewTitle, { color: theme.text }]}>Receipt AI modes</Text>
            {receiptAnalysisCapabilities.map((capability) => (
              <View key={capability.id} style={styles.receiptCapabilityRow}>
                <Text style={[styles.capabilityLabel, { color: theme.text }]}>
                  {capability.label} -{' '}
                  {capability.status === 'available'
                    ? 'Active now'
                    : capability.status === 'reserved'
                      ? 'Reserved'
                      : 'Manual only'}
                </Text>
                <Text style={[styles.receiptPreviewMeta, { color: theme.textMuted }]}>
                  {capability.description}
                </Text>
              </View>
            ))}
          </View>
          {isAnalyzingReceipt ? (
            <Text style={[styles.supportText, { color: theme.textMuted }]}>
              Reading the receipt for merchant name, total amount, and line items...
            </Text>
          ) : null}
          {!isAnalyzingReceipt && tripDraft.receiptAnalysis ? (
            <View
              style={[
                styles.receiptAnalysisCard,
                {
                  backgroundColor: theme.surface,
                  borderColor: theme.border,
                },
              ]}>
              <Text style={[styles.receiptPreviewTitle, { color: theme.text }]}>
                Receipt extraction
              </Text>
              <Text style={[styles.receiptPreviewMeta, { color: theme.textMuted }]}>
                {tripDraft.receiptAnalysis.merchantName
                  ? `${tripDraft.receiptAnalysis.merchantName} - `
                  : ''}
                {tripDraft.receiptAnalysis.detectedTotalSpendCents
                  ? `Detected total ${formatCurrency(tripDraft.receiptAnalysis.detectedTotalSpendCents, snapshot.household.currencyCode)}`
                  : 'No confident total was extracted'}
              </Text>
              {!tripDraft.receiptAnalysis.detectedTotalSpendCents ? (
                <Text style={[styles.tripItems, { color: theme.textMuted }]}>
                  {getAdvancedReceiptTranscriptionMessage()}
                </Text>
              ) : null}
              {tripDraft.receiptAnalysis.items.length > 0 ? (
                <View style={styles.receiptItemList}>
                  {tripDraft.receiptAnalysis.items.map((item, index) => (
                    <Text
                      key={`${item.name}-${index}`}
                      style={[styles.tripItems, { color: theme.textMuted }]}>
                      {item.name} - {item.quantity} - {item.category}
                    </Text>
                  ))}
                </View>
              ) : (
                <Text style={[styles.tripItems, { color: theme.textMuted }]}>
                  No confident line items were extracted from this image yet.
                </Text>
              )}
            </View>
          ) : null}
        </View>

        <View style={styles.fieldBlock}>
          <Text style={[styles.fieldLabel, { color: theme.textMuted }]}>Purchased items</Text>
          <Text style={[styles.supportText, { color: theme.textMuted }]}>
            Review what will be stored in this purchase history. You can edit OCR results, add missing
            lines manually, and use any category that fits, like Gardening or Other.
          </Text>
          <View style={styles.actionRow}>
            <ActionButton
              label="Add purchased item"
              tone="secondary"
              onPress={addTripPurchasedItemDraft}
              disabled={isSaving || isAnalyzingReceipt}
            />
            {tripDraft.receiptAnalysis?.items.length ? (
              <ActionButton
                label="Use detected items"
                tone="secondary"
                onPress={applyReceiptDetectedItems}
                disabled={isSaving || isAnalyzingReceipt}
              />
            ) : null}
          </View>
          {tripDraft.purchasedItemsDraft.length === 0 ? (
            <Text style={[styles.tripItems, { color: theme.textMuted }]}>
              No reviewed purchased items yet. Add them manually or load the receipt-detected lines.
            </Text>
          ) : (
            <View style={styles.tripDraftList}>
              {tripDraft.purchasedItemsDraft.map((item, index) => (
                <View
                  key={`trip-draft-item-${index}`}
                  style={[
                    styles.tripDraftCard,
                    {
                      backgroundColor: theme.surface,
                      borderColor: theme.border,
                    },
                  ]}>
                  <View style={styles.formGrid}>
                    <View style={styles.fieldBlock}>
                      <Text style={[styles.fieldLabel, { color: theme.textMuted }]}>Item name</Text>
                      <TextInput
                        value={item.name}
                        onChangeText={(name) =>
                          updateTripPurchasedItemDraft(index, {
                            name,
                          })
                        }
                        placeholder="Tomatoes"
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
                    <View style={styles.fieldBlock}>
                      <Text style={[styles.fieldLabel, { color: theme.textMuted }]}>Quantity</Text>
                      <TextInput
                        value={item.quantity}
                        onChangeText={(quantity) =>
                          updateTripPurchasedItemDraft(index, {
                            quantity,
                          })
                        }
                        placeholder="1"
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
                    <View style={styles.fieldBlock}>
                      <Text style={[styles.fieldLabel, { color: theme.textMuted }]}>Category</Text>
                      <TextInput
                        value={item.category}
                        onChangeText={(category) =>
                          updateTripPurchasedItemDraft(index, {
                            category,
                          })
                        }
                        placeholder="Produce, Pantry, Gardening, Other..."
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
                  <View style={styles.actionRow}>
                    <ActionButton
                      label="Remove item"
                      tone="secondary"
                      onPress={() => removeTripPurchasedItemDraft(index)}
                      disabled={isSaving || isAnalyzingReceipt}
                    />
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>

        <Text style={[styles.supportText, { color: theme.textMuted }]}>
          {model.readyItems.length === 0
            ? finalTripItemsCount
              ? `${finalTripItemsCount} reviewed purchased item${finalTripItemsCount === 1 ? '' : 's'} will be stored in this purchase history.`
              : 'No basket items are marked as bought yet, but you can still save this as an ad hoc purchase with the total spend and receipt proof.'
            : finalTripItemsCount
              ? `${finalTripItemsCount} total purchased item${finalTripItemsCount === 1 ? '' : 's'} will be stored after combining the bought basket items with your reviewed receipt lines.`
              : `${model.readyItems.length} bought item${model.readyItems.length === 1 ? '' : 's'} will move into the purchase history.`}
        </Text>

        <ActionButton
          label={`Record purchase as ${selectedMember.name}`}
          onPress={() => void completeTrip()}
          disabled={isSaving || isAnalyzingReceipt}
        />
      </SectionCard>

      <SectionCard
        title="Recent purchases"
        description="A lightweight spend trail for the household, without item-level budgeting complexity.">
        {snapshot.trips.length === 0 ? (
          <Text style={[styles.emptyMessage, { color: theme.textMuted }]}>
            Your first recorded purchase will appear here.
          </Text>
        ) : (
          snapshot.trips.map((trip) => {
            const shopper =
              snapshot.members.find((member) => member.id === trip.shopperMemberId)?.name ?? 'Unknown';
            const preview = trip.purchasedItems.slice(0, 3).map((item) => item.name).join(', ');
            const extraCount = Math.max(trip.purchasedItems.length - 3, 0);
            const purchasedSummary =
              preview.length > 0
                ? `${preview}${extraCount > 0 ? ` +${extraCount} more` : ''}`
                : 'No basket items were pre-marked for this purchase.';

            return (
              <View
                key={trip.id}
                style={[
                  styles.tripRow,
                  {
                    backgroundColor: theme.surface,
                    borderColor: theme.border,
                  },
                ]}>
                <View style={styles.tripHeading}>
                  <View style={styles.tripCopy}>
                    <Text style={[styles.tripStore, { color: theme.text }]}>{trip.store}</Text>
                    <Text style={[styles.tripMeta, { color: theme.textMuted }]}>
                      {shopper} - {formatShortDate(trip.completedAt)}
                    </Text>
                  </View>
                  <Text style={[styles.tripTotal, { color: theme.primaryStrong }]}>
                    {formatCurrency(trip.totalSpendCents, snapshot.household.currencyCode)}
                  </Text>
                </View>
                <Text style={[styles.tripItems, { color: theme.textMuted }]}>
                  {purchasedSummary}
                </Text>
                {trip.purchasedItems.length > 0 ? (
                  <View style={styles.receiptItemList}>
                    {trip.purchasedItems.slice(0, 6).map((item) => (
                      <Text
                        key={`${trip.id}-${item.id}`}
                        style={[styles.tripItems, { color: theme.textMuted }]}>
                        {item.name} - {item.quantity} - {item.category}
                      </Text>
                    ))}
                    {trip.purchasedItems.length > 6 ? (
                      <Text style={[styles.tripItems, { color: theme.textMuted }]}>
                        +{trip.purchasedItems.length - 6} more items
                      </Text>
                    ) : null}
                  </View>
                ) : null}
                {trip.note ? (
                  <Text style={[styles.tripItems, { color: theme.textMuted }]}>{trip.note}</Text>
                ) : null}
                {trip.purchasedItems.length > 0 ? (
                  <ActionButton
                    label={`Add back as ${selectedMember.name}`}
                    tone="secondary"
                    onPress={() => void addTripItemsBackToBasket(trip.id)}
                    disabled={isSaving}
                  />
                ) : null}
                {trip.receipt ? (
                  <View
                    style={[
                      styles.receiptHistoryCard,
                      {
                        backgroundColor: theme.surfaceMuted,
                        borderColor: theme.border,
                      },
                    ]}>
                    <Image source={{ uri: trip.receipt.downloadUrl }} style={styles.receiptHistoryImage} />
                    <View style={styles.receiptPreviewCopy}>
                      <Text style={[styles.receiptPreviewTitle, { color: theme.text }]}>
                        Receipt attached
                      </Text>
                      <Text style={[styles.receiptPreviewMeta, { color: theme.textMuted }]}>
                        {trip.receipt.fileName} - {formatLongDate(trip.receipt.uploadedAt)}
                      </Text>
                    </View>
                    <ActionButton
                      label="Open receipt"
                      tone="secondary"
                      onPress={() => void Linking.openURL(trip.receipt!.downloadUrl)}
                    />
                  </View>
                ) : null}
              </View>
            );
          })
        )}
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
    minHeight: 108,
    borderWidth: 1,
    borderRadius: Radii.medium,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
    fontFamily: Fonts.sans,
    fontSize: 16,
    textAlignVertical: 'top',
  },
  actionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  receiptPreviewCard: {
    flexDirection: 'row',
    gap: Spacing.three,
    borderWidth: 1,
    borderRadius: Radii.medium,
    padding: Spacing.three,
    alignItems: 'center',
  },
  receiptPreviewImage: {
    width: 88,
    height: 88,
    borderRadius: Radii.medium,
  },
  receiptPreviewCopy: {
    flex: 1,
    gap: Spacing.one,
  },
  receiptAnalysisCard: {
    borderWidth: 1,
    borderRadius: Radii.medium,
    padding: Spacing.three,
    gap: Spacing.two,
  },
  receiptCapabilityCard: {
    borderWidth: 1,
    borderRadius: Radii.medium,
    padding: Spacing.three,
    gap: Spacing.two,
  },
  receiptCapabilityRow: {
    gap: Spacing.one,
  },
  capabilityLabel: {
    fontFamily: Fonts.sans,
    fontSize: 14,
    fontWeight: '700',
  },
  receiptItemList: {
    gap: Spacing.one,
  },
  tripDraftList: {
    gap: Spacing.two,
  },
  tripDraftCard: {
    borderWidth: 1,
    borderRadius: Radii.medium,
    padding: Spacing.three,
    gap: Spacing.two,
  },
  receiptPreviewTitle: {
    fontFamily: Fonts.sans,
    fontSize: 15,
    fontWeight: '800',
  },
  receiptPreviewMeta: {
    fontFamily: Fonts.sans,
    fontSize: 13,
    lineHeight: 20,
  },
  supportText: {
    fontFamily: Fonts.sans,
    fontSize: 14,
    lineHeight: 22,
  },
  emptyMessage: {
    fontFamily: Fonts.sans,
    fontSize: 15,
    lineHeight: 22,
  },
  tripRow: {
    borderWidth: 1,
    borderRadius: Radii.medium,
    padding: Spacing.three,
    gap: Spacing.one,
  },
  tripHeading: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: Spacing.three,
  },
  tripCopy: {
    flex: 1,
    gap: 2,
  },
  tripStore: {
    fontFamily: Fonts.rounded,
    fontSize: 18,
    fontWeight: '800',
  },
  tripMeta: {
    fontFamily: Fonts.sans,
    fontSize: 13,
  },
  tripTotal: {
    fontFamily: Fonts.rounded,
    fontSize: 20,
    fontWeight: '800',
  },
  tripItems: {
    fontFamily: Fonts.sans,
    fontSize: 14,
    lineHeight: 22,
  },
  receiptHistoryCard: {
    borderWidth: 1,
    borderRadius: Radii.medium,
    padding: Spacing.three,
    gap: Spacing.three,
  },
  receiptHistoryImage: {
    width: '100%',
    height: 180,
    borderRadius: Radii.medium,
  },
});
