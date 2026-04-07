import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';

const ANDROID_BASKET_BADGE_CHANNEL_ID = 'basket-badge-count';
const ANDROID_BASKET_BADGE_NOTIFICATION_STORAGE_KEY = 'home-basket:basket-badge-notification-id';

let badgePermissionRequestedThisSession = false;
let notificationHandlerConfigured = false;
let lastBadgeDebugState = {
  badgeCount: 0,
  directBadgeSet: false,
  fallbackNotificationSet: false,
  permissionGranted: false,
  channelReady: false,
  platform: Platform.OS,
  updatedAt: '',
};

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
    return false;
  }

  await Notifications.setNotificationChannelAsync(ANDROID_BASKET_BADGE_CHANNEL_ID, {
    name: 'Basket badge count',
    description: 'Keeps the app icon badge aligned with items still to buy.',
    importance: Notifications.AndroidImportance.MIN,
    showBadge: true,
    enableVibrate: false,
    sound: null,
  });

  return true;
}

async function ensureBadgePermissionAsync() {
  if (Platform.OS === 'android') {
    lastBadgeDebugState = {
      ...lastBadgeDebugState,
      channelReady: await ensureAndroidBadgeChannelAsync(),
    };

    const currentPermissions = await Notifications.getPermissionsAsync();

    if (currentPermissions.granted) {
      lastBadgeDebugState = {
        ...lastBadgeDebugState,
        permissionGranted: true,
      };
      return true;
    }

    if (badgePermissionRequestedThisSession) {
      return false;
    }

    badgePermissionRequestedThisSession = true;

    const requestedPermissions = await Notifications.requestPermissionsAsync();
    lastBadgeDebugState = {
      ...lastBadgeDebugState,
      permissionGranted: requestedPermissions.granted,
    };
    return requestedPermissions.granted;
  }

  if (Platform.OS !== 'ios') {
    return true;
  }

  const currentPermissions = await Notifications.getPermissionsAsync();

  if (currentPermissions.granted || currentPermissions.ios?.allowsBadge) {
    lastBadgeDebugState = {
      ...lastBadgeDebugState,
      permissionGranted: true,
    };
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

  lastBadgeDebugState = {
    ...lastBadgeDebugState,
    permissionGranted: requestedPermissions.granted || Boolean(requestedPermissions.ios?.allowsBadge),
  };

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
  lastBadgeDebugState = {
    ...lastBadgeDebugState,
    channelReady: await ensureAndroidBadgeChannelAsync(),
  };
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
  lastBadgeDebugState = {
    ...lastBadgeDebugState,
    fallbackNotificationSet: true,
  };
  return true;
}

export async function syncPendingItemsBadgeCountAsync(pendingItemsCount: number) {
  const badgeCount = normalizeBadgeCount(pendingItemsCount);

  try {
    lastBadgeDebugState = {
      badgeCount,
      directBadgeSet: false,
      fallbackNotificationSet: false,
      permissionGranted: badgeCount <= 0,
      channelReady: Platform.OS !== 'android',
      platform: Platform.OS,
      updatedAt: new Date().toISOString(),
    };

    if (badgeCount > 0 || Platform.OS === 'android') {
      const canSetBadge = await ensureBadgePermissionAsync();

      if (!canSetBadge) {
        return false;
      }
    }

    const directBadgeSet = await Notifications.setBadgeCountAsync(badgeCount);
    lastBadgeDebugState = {
      ...lastBadgeDebugState,
      directBadgeSet,
    };

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

export async function getAppIconBadgeDebugInfoAsync(pendingItemsCount: number) {
  const result = await syncPendingItemsBadgeCountAsync(pendingItemsCount);
  const currentPermissions = await Notifications.getPermissionsAsync();
  const androidChannel =
    Platform.OS === 'android'
      ? await Notifications.getNotificationChannelAsync(ANDROID_BASKET_BADGE_CHANNEL_ID)
      : null;

  return {
    ...lastBadgeDebugState,
    result,
    permissionStatus: currentPermissions.status,
    androidImportance: androidChannel?.importance ?? null,
    androidShowBadge: androidChannel?.showBadge ?? null,
  };
}
