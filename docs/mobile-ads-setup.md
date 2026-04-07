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

These real values are now configured in the `production` profile in `eas.json`:

```bash
EXPO_PUBLIC_ADMOB_ANDROID_APP_ID=ca-app-pub-4275448719705182~5145501182
EXPO_PUBLIC_ADMOB_ANDROID_BANNER_ID=ca-app-pub-4275448719705182/5994511016
EXPO_PUBLIC_ADMOB_ANDROID_INTERSTITIAL_ID=ca-app-pub-4275448719705182/9545474292
EXPO_PUBLIC_ADMOB_IOS_APP_ID=ca-app-pub-4275448719705182~6919310952
EXPO_PUBLIC_ADMOB_IOS_BANNER_ID=ca-app-pub-4275448719705182/7849249244
EXPO_PUBLIC_ADMOB_IOS_INTERSTITIAL_ID=ca-app-pub-4275448719705182/6456276528
EXPO_PUBLIC_ADS_ENABLED=true
EXPO_PUBLIC_ADMOB_USE_TEST_IDS=false
```

## app-ads.txt

AdMob should be able to verify the developer website from the store listing.

Use this developer website in Google Play:

```text
https://homebasketapp.com
```

The root `app-ads.txt` file is included in the repo at:

```text
public/app-ads.txt
```

Expected live URL after the next Firebase Hosting deploy:

```text
https://homebasketapp.com/app-ads.txt
```

Expected content:

```text
google.com, pub-4275448719705182, DIRECT, f08c47fec0942fa0
```

## Preview builds

Preview and development builds are already configured to use Google sample app IDs and test ad units.
That lets you test the full banner/interstitial flow safely before real monetization goes live.

Ad timing is also intentionally softened:

- preview builds wait until the app has been opened 3 times before ads can appear
- production builds wait until the app has been opened 10 times before ads can appear

## Placement notes

- Banner ads appear near the top of the main mobile screens: `List`, `Purchases`, and `Household`
- Interstitial ads only show at a natural pause, not while the user is typing or editing
- Ads are delayed on fresh installs so the first-run experience stays clean
- Web stays ad-free for now

## Recommended rollout order

1. Test preview ads on Android and iPhone
2. Confirm consent flow on a European device or test region
3. Confirm real AdMob IDs are still present in the production build profile
4. Rebuild Android and iPhone production binaries
5. Update store privacy/data safety forms before submission
6. Deploy web so `https://homebasketapp.com/app-ads.txt` is live
