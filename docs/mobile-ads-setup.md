# Mobile ads setup

Home Basket now supports:

- top banner ads on the main mobile screens
- occasional full-screen interstitial ads after a natural pause, currently after recording a purchase
- Google consent handling on Android and iPhone builds

## Services to activate

1. Create a Google AdMob account
   - https://apps.admob.com
2. Add both apps inside AdMob
   - Android app for `com.transcripe.homebasket`
   - iPhone app for `com.transcripe.homebasket`
3. Create ad units
   - one `Banner` unit for Android
   - one `Interstitial` unit for Android
   - one `Banner` unit for iPhone
   - one `Interstitial` unit for iPhone
4. Configure `Privacy & messaging` in AdMob
   - activate GDPR/EEA messaging if you want European traffic
   - activate U.S. state privacy messaging if relevant to your audience
5. Review `Blocking controls` in AdMob
   - block gambling, dating, and other categories that do not fit the product
   - reduce gaming-heavy inventory if you want ads to skew more toward retail, finance, and household services
6. Mark the Android app as containing ads in Google Play Console
7. Update App Store Connect privacy answers to reflect advertising data and consent handling

## Environment values to set before store builds

Add these real values to your EAS production environment before the final store builds:

```bash
EXPO_PUBLIC_ADMOB_ANDROID_APP_ID=ca-app-pub-xxxxxxxxxxxxxxxx~xxxxxxxxxx
EXPO_PUBLIC_ADMOB_IOS_APP_ID=ca-app-pub-xxxxxxxxxxxxxxxx~xxxxxxxxxx
EXPO_PUBLIC_ADMOB_ANDROID_BANNER_ID=ca-app-pub-xxxxxxxxxxxxxxxx/xxxxxxxxxx
EXPO_PUBLIC_ADMOB_IOS_BANNER_ID=ca-app-pub-xxxxxxxxxxxxxxxx/xxxxxxxxxx
EXPO_PUBLIC_ADMOB_ANDROID_INTERSTITIAL_ID=ca-app-pub-xxxxxxxxxxxxxxxx/xxxxxxxxxx
EXPO_PUBLIC_ADMOB_IOS_INTERSTITIAL_ID=ca-app-pub-xxxxxxxxxxxxxxxx/xxxxxxxxxx
EXPO_PUBLIC_ADS_ENABLED=true
EXPO_PUBLIC_ADMOB_USE_TEST_IDS=false
```

## Preview builds

Preview and development builds are already configured to use Google sample app IDs and test ad units.
That lets you test the full banner/interstitial flow safely before real monetization goes live.

## Placement notes

- Banner ads appear near the top of the main mobile screens: `List`, `Purchases`, and `Household`
- Interstitial ads only show at a natural pause, not while the user is typing or editing
- Web stays ad-free for now

## Recommended rollout order

1. Test preview ads on Android and iPhone
2. Confirm consent flow on a European device or test region
3. Add real AdMob IDs to production environment
4. Rebuild Android and iPhone production binaries
5. Update store privacy/data safety forms before submission
