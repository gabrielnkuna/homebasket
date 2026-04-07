import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';

const ANDROID_BASKET_BADGE_CHANNEL_ID = 'basket-badge-count';
const ANDROID_BASKET_BADGE_NOTIFICATION_STORAGE_KEY = 'home-basket:basket-badge-notification-id';

let badgePermissionRequestedThisSession = false;
let notificationHandlerConfigured = false;

function normalizeBadgeCount(count: number) {
  if (!Number.isFinite(count) || count <= 0) {
    return 0;
  }

  return Math.floor(count);
}

function configureAndroidNotificationHandler() {
  if (notificationHandlerConfigured || Platform.OS !== 'android') {
    return;
  }

  notificationHandlerConfigured = true;

  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: false,
      shouldShowList: true,
      shouldPlaySound: false,
      shouldSetBadge: true,
    }),
  });
}

async function ensureAndroidBadgeChannelAsync() {
  if (Platform.OS !== 'android') {
    return;
  }

  await Notifications.setNotificationChannelAsync(ANDROID_BASKET_BADGE_CHANNEL_ID, {
    name: 'Basket badge count',
    description: 'Keeps the app icon badge aligned with items still to buy.',
    importance: Notifications.AndroidImportance.MIN,
    showBadge: true,
    enableVibrate: false,
    sound: null,
  });
}

async function ensureBadgePermissionAsync() {
  if (Platform.OS === 'android') {
    await ensureAndroidBadgeChannelAsync();

    const currentPermissions = await Notifications.getPermissionsAsync();

    if (currentPermissions.granted) {
      return true;
    }

    if (badgePermissionRequestedThisSession) {
      return false;
    }

    badgePermissionRequestedThisSession = true;

    const requestedPermissions = await Notifications.requestPermissionsAsync();
    return requestedPermissions.granted;
  }

  if (Platform.OS !== 'ios') {
    return true;
  }

  const currentPermissions = await Notifications.getPermissionsAsync();

  if (currentPermissions.granted || currentPermissions.ios?.allowsBadge) {
    return true;
  }

  if (badgePermissionRequestedThisSession) {
    return false;
  }

  badgePermissionRequestedThisSession = true;

  const requestedPermissions = await Notifications.requestPermissionsAsync({
    ios: {
      allowAlert: false,
      allowBadge: true,
      allowSound: false,
    },
  });

  return requestedPermissions.granted || Boolean(requestedPermissions.ios?.allowsBadge);
}

async function clearAndroidBadgeNotificationAsync() {
  const existingNotificationId = await AsyncStorage.getItem(
    ANDROID_BASKET_BADGE_NOTIFICATION_STORAGE_KEY
  );

  if (!existingNotificationId) {
    return;
  }

  await Notifications.dismissNotificationAsync(existingNotificationId);
  await AsyncStorage.removeItem(ANDROID_BASKET_BADGE_NOTIFICATION_STORAGE_KEY);
}

async function syncAndroidBadgeNotificationAsync(badgeCount: number) {
  if (Platform.OS !== 'android') {
    return false;
  }

  configureAndroidNotificationHandler();
  await ensureAndroidBadgeChannelAsync();
  await clearAndroidBadgeNotificationAsync();

  if (badgeCount <= 0) {
    return true;
  }

  const notificationId = await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Home Basket',
      body: `${badgeCount} item${badgeCount === 1 ? '' : 's'} still to buy`,
      badge: badgeCount,
      sound: false,
      priority: Notifications.AndroidNotificationPriority.MIN,
      color: '#1A4731',
      autoDismiss: false,
      data: {
        source: 'basket-badge-count',
      },
    },
    trigger: {
      channelId: ANDROID_BASKET_BADGE_CHANNEL_ID,
    },
  });

  await AsyncStorage.setItem(ANDROID_BASKET_BADGE_NOTIFICATION_STORAGE_KEY, notificationId);
  return true;
}

export async function syncPendingItemsBadgeCountAsync(pendingItemsCount: number) {
  const badgeCount = normalizeBadgeCount(pendingItemsCount);

  try {
    if (badgeCount > 0 || Platform.OS === 'android') {
      const canSetBadge = await ensureBadgePermissionAsync();

      if (!canSetBadge) {
        return false;
      }
    }

    const directBadgeSet = await Notifications.setBadgeCountAsync(badgeCount);

    if (Platform.OS === 'android') {
      if (badgeCount <= 0) {
        await clearAndroidBadgeNotificationAsync();
        return directBadgeSet;
      }

      if (!directBadgeSet) {
        return syncAndroidBadgeNotificationAsync(badgeCount);
      }
    }

    return directBadgeSet;
  } catch (error) {
    if (__DEV__) {
      console.warn('Home Basket could not update the app icon badge.', error);
    }

    return false;
  }
}
