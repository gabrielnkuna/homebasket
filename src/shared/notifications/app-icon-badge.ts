export async function syncPendingItemsBadgeCountAsync(_pendingItemsCount: number) {
  return false;
}

export async function getAppIconBadgeDebugInfoAsync(_pendingItemsCount: number) {
  return {
    badgeCount: 0,
    directBadgeSet: false,
    permissionGranted: false,
    channelReady: false,
    platform: 'web',
    updatedAt: new Date().toISOString(),
    result: false,
    permissionStatus: 'web-unavailable',
    androidImportance: null,
    androidShowBadge: null,
  };
}
