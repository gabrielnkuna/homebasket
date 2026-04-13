import {
  Tabs,
  TabList,
  TabTrigger,
  TabSlot,
  TabTriggerSlotProps,
  TabListProps,
} from 'expo-router/ui';
import React from 'react';
import { usePathname } from 'expo-router';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  useColorScheme,
  useWindowDimensions,
} from 'react-native';

import { Colors, Fonts, MaxContentWidth, Radii, Spacing } from '@/constants/theme';
import { useHomeBasketStore } from '@/features/home-basket/presentation/use-home-basket-store';
import { BrandBadge, BrandNavLockup } from '@/shared/ui';

export default function AppTabs() {
  const pathname = usePathname();
  const { width } = useWindowDimensions();
  const clearError = useHomeBasketStore((state) => state.clearError);
  const previousPathnameRef = React.useRef(pathname);
  const isCompactHeader = width < 640;

  React.useEffect(() => {
    if (previousPathnameRef.current !== pathname) {
      previousPathnameRef.current = pathname;

      if (useHomeBasketStore.getState().error) {
        clearError();
      }
    }
  }, [clearError, pathname]);

  return (
    <Tabs>
      <TabSlot style={{ height: '100%' }} />
      <TabList asChild>
        <CustomTabList compact={isCompactHeader}>
          <View style={styles.brandBlock}>
            {isCompactHeader ? <BrandBadge size={34} /> : <BrandNavLockup />}
          </View>

          <TabTrigger name="list" href="/" asChild>
            <TabButton compact={isCompactHeader}>List</TabButton>
          </TabTrigger>
          <TabTrigger name="purchases" href="/purchases" asChild>
            <TabButton compact={isCompactHeader}>Purchases</TabButton>
          </TabTrigger>
          <TabTrigger name="household" href="/household" asChild>
            <TabButton compact={isCompactHeader}>Household</TabButton>
          </TabTrigger>
        </CustomTabList>
      </TabList>
    </Tabs>
  );
}

type TabButtonProps = TabTriggerSlotProps & {
  compact?: boolean;
};

export function TabButton({ children, isFocused, compact = false, ...props }: TabButtonProps) {
  const scheme = useColorScheme();
  const theme = Colors[scheme === 'dark' ? 'dark' : 'light'];

  return (
    <Pressable {...props} style={({ pressed }) => pressed && styles.pressed}>
      <View
        style={[
          styles.tabButtonView,
          compact && styles.tabButtonViewCompact,
          {
            backgroundColor: isFocused ? theme.primarySoft : theme.surfaceMuted,
            borderColor: theme.border,
          },
        ]}>
        <Text
          style={[
            styles.tabButtonText,
            compact && styles.tabButtonTextCompact,
            { color: isFocused ? theme.text : theme.textMuted },
          ]}>
          {children}
        </Text>
      </View>
    </Pressable>
  );
}

type CustomTabListProps = TabListProps & {
  compact?: boolean;
};

export function CustomTabList({ compact = false, ...props }: CustomTabListProps) {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];

  return (
    <View {...props} style={[styles.tabListContainer, compact && styles.tabListContainerCompact]}>
      <View
        style={[
          styles.innerContainer,
          compact && styles.innerContainerCompact,
          {
            backgroundColor: colors.surface,
            borderColor: colors.border,
          },
        ]}>
        {props.children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  tabListContainer: {
    position: 'absolute',
    width: '100%',
    padding: Spacing.three,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  tabListContainerCompact: {
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.two,
  },
  innerContainer: {
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.five,
    borderRadius: Radii.large,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    flexGrow: 1,
    gap: Spacing.two,
    maxWidth: MaxContentWidth,
  },
  innerContainerCompact: {
    width: '100%',
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.two,
    gap: Spacing.one,
  },
  brandBlock: {
    marginRight: 'auto',
  },
  pressed: {
    opacity: 0.7,
  },
  tabButtonView: {
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
    borderRadius: Radii.pill,
    borderWidth: 1,
  },
  tabButtonViewCompact: {
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.two,
  },
  tabButtonText: {
    fontFamily: Fonts.sans,
    fontSize: 13,
    fontWeight: '700',
  },
  tabButtonTextCompact: {
    fontSize: 12,
  },
});
