import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';

let badgePermissionRequestedThisSession = false;

function normalizeBadgeCount(count: number) {
  if (!Number.isFinite(count) || count <= 0) {
    return 0;
  }

  return Math.floor(count);
}

async function ensureBadgePermissionAsync() {
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

export async function syncPendingItemsBadgeCountAsync(pendingItemsCount: number) {
  const badgeCount = normalizeBadgeCount(pendingItemsCount);

  try {
    if (badgeCount > 0) {
      const canSetBadge = await ensureBadgePermissionAsync();

      if (!canSetBadge) {
        return false;
      }
    }

    return Notifications.setBadgeCountAsync(badgeCount);
  } catch (error) {
    if (__DEV__) {
      console.warn('Home Basket could not update the app icon badge.', error);
    }

    return false;
  }
}
