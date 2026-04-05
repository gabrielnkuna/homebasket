import {
  Tabs,
  TabList,
  TabSlot,
  TabTrigger,
  TabTriggerSlotProps,
  TabListProps,
} from 'expo-router/ui';
import React from 'react';
import { Pressable, StyleSheet, Text, View, useColorScheme } from 'react-native';
import { usePathname, useRouter } from 'expo-router';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';

import { Colors, Fonts, MaxContentWidth, Radii, Spacing } from '@/constants/theme';

const swipeRoutes = ['/', '/purchases', '/household'] as const;

export default function AppTabs() {
  const pathname = usePathname();
  const router = useRouter();
  const activeSwipeIndex = (swipeRoutes as readonly string[]).indexOf(pathname);
  const nativeGesture = React.useMemo(() => Gesture.Native(), []);
  const swipeGesture = React.useMemo(
    () =>
      Gesture.Pan()
        .runOnJS(true)
        .simultaneousWithExternalGesture(nativeGesture)
        .activeOffsetX([-18, 18])
        .failOffsetY([-72, 72])
        .onEnd((event) => {
          if (
            activeSwipeIndex === -1 ||
            Math.abs(event.translationX) < 56 ||
            Math.abs(event.translationX) < Math.abs(event.translationY) * 1.15
          ) {
            return;
          }

          const direction = event.translationX < 0 ? 1 : -1;
          const nextRoute = swipeRoutes[activeSwipeIndex + direction];

          if (nextRoute && nextRoute !== pathname) {
            router.navigate(nextRoute);
          }
        }),
    [activeSwipeIndex, nativeGesture, pathname, router]
  );

  return (
    <Tabs>
      <GestureDetector gesture={Gesture.Simultaneous(nativeGesture, swipeGesture)}>
        <TabSlot style={styles.tabSlot} />
      </GestureDetector>
      <TabList asChild>
        <CustomTabList>
          <TabTrigger name="list" href="/" asChild>
            <TabButton>List</TabButton>
          </TabTrigger>
          <TabTrigger name="purchases" href="/purchases" asChild>
            <TabButton>Purchases</TabButton>
          </TabTrigger>
          <TabTrigger name="household" href="/household" asChild>
            <TabButton>Household</TabButton>
          </TabTrigger>
        </CustomTabList>
      </TabList>
    </Tabs>
  );
}

function TabButton({ children, isFocused, ...props }: TabTriggerSlotProps) {
  const scheme = useColorScheme();
  const theme = Colors[scheme === 'dark' ? 'dark' : 'light'];

  return (
    <Pressable {...props} style={({ pressed }) => pressed && styles.pressed}>
      <View
        style={[
          styles.tabButtonView,
          {
            backgroundColor: isFocused ? theme.primarySoft : theme.surfaceMuted,
            borderColor: theme.border,
          },
        ]}>
        <Text style={[styles.tabButtonText, { color: isFocused ? theme.text : theme.textMuted }]}>
          {children}
        </Text>
      </View>
    </Pressable>
  );
}

function CustomTabList(props: TabListProps) {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];

  return (
    <View {...props} style={styles.tabListContainer}>
      <View
        style={[
          styles.innerContainer,
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
  tabSlot: {
    height: '100%',
  },
  tabListContainer: {
    position: 'absolute',
    width: '100%',
    padding: Spacing.three,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  innerContainer: {
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.five,
    borderRadius: Radii.large,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    borderWidth: 1,
    flexGrow: 1,
    gap: Spacing.two,
    maxWidth: MaxContentWidth,
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
  tabButtonText: {
    fontFamily: Fonts.sans,
    fontSize: 13,
    fontWeight: '700',
  },
});
