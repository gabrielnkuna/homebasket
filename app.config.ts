const baseExpoConfig = require('./app.json').expo;

const SAMPLE_ADMOB_ANDROID_APP_ID = 'ca-app-pub-3940256099942544~3347511713';
const SAMPLE_ADMOB_IOS_APP_ID = 'ca-app-pub-3940256099942544~1458002511';

function isPluginEntry(entry: unknown, pluginName: string) {
  if (typeof entry === 'string') {
    return entry === pluginName;
  }

  return Array.isArray(entry) && entry[0] === pluginName;
}

function getConfiguredAdMobAppId(platform: 'android' | 'ios') {
  const envName =
    platform === 'android'
      ? 'EXPO_PUBLIC_ADMOB_ANDROID_APP_ID'
      : 'EXPO_PUBLIC_ADMOB_IOS_APP_ID';
  const sampleAppId =
    platform === 'android' ? SAMPLE_ADMOB_ANDROID_APP_ID : SAMPLE_ADMOB_IOS_APP_ID;
  const profile = process.env.EAS_BUILD_PROFILE ?? '';
  const configuredAppId = process.env[envName];

  if (configuredAppId) {
    return configuredAppId;
  }

  if (profile === 'production') {
    throw new Error(
      `Missing ${envName}. Add your real AdMob app IDs before creating a production mobile build.`
    );
  }

  return sampleAppId;
}

const filteredPlugins = (baseExpoConfig.plugins ?? []).filter(
  (entry: unknown) =>
    !isPluginEntry(entry, 'react-native-google-mobile-ads') &&
    !isPluginEntry(entry, 'expo-build-properties')
);

const notificationPlugin = filteredPlugins.some((entry: unknown) =>
  isPluginEntry(entry, 'expo-notifications')
)
  ? []
  : ['expo-notifications'];

const configuredPlugins = [
  ...filteredPlugins,
  ...notificationPlugin,
  [
    'react-native-google-mobile-ads',
    {
      androidAppId: getConfiguredAdMobAppId('android'),
      iosAppId: getConfiguredAdMobAppId('ios'),
    },
  ],
];

module.exports = {
  expo: {
    ...baseExpoConfig,
    plugins: configuredPlugins,
  },
};
