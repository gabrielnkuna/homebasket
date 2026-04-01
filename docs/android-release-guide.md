# Android Production Release Guide

This guide is tailored to the current Home Basket repo.

## What is already ready

Based on the current config in `app.json`:

- App name is set to `Home Basket`
- Version is set to `1.0.0`
- App icon is configured
- Android adaptive icon is configured
- Splash screen branding is configured
- Deep link scheme is configured as `homebasket`
- Receipt image permission copy is configured
- EAS build and submit profiles are now available in `eas.json`

## What still needs a real decision before first store release

### 1. Android package name

This is required before the first Play Store release.

Current repo choice:

- `com.transcripe.homebasket`

Important:

- Pick this carefully because changing it after launch creates a new app identity.
- This repo now uses `com.transcripe.homebasket` in `app.json`.

### 2. iOS bundle identifier

Not required for Android launch, but decide it early if iOS is coming soon.

Current repo choice:

- `com.transcripe.homebasket`

### 3. Play Console support and policy links

Before submission, prepare:

- support email
- privacy policy URL
- optional marketing site URL

## Build profiles now available

This repo now has these EAS profiles:

- `development`: internal development client
- `preview`: internal Android APK
- `production`: Android App Bundle for Play Store
- `submit.internal`: submit to internal testing track
- `submit.production`: submit to production track

## Recommended first-release flow

1. Keep the Android package name in `app.json` as `com.transcripe.homebasket`.
2. Log in to Expo and EAS.
3. Build an internal Android preview.
4. Test on real devices.
5. Build a production Android App Bundle.
6. Submit first to internal testing in Play Console.
7. Promote to production after final checks.

## Commands

Install EAS CLI if needed:

```bash
npm install -g eas-cli
```

Log in:

```bash
eas login
```

Configure the project:

```bash
eas build:configure
```

Create an internal Android APK:

```bash
eas build --platform android --profile preview
```

Create a production Android App Bundle:

```bash
eas build --platform android --profile production
```

Submit to internal testing:

```bash
eas submit --platform android --profile internal
```

Submit to production:

```bash
eas submit --platform android --profile production
```

## Service account note

For automated Play submission, you will need a Google Play service account key with the correct Play Console permissions.

Do not commit that JSON key into the repo.

## Privacy policy note

Google Play requires a public privacy policy URL. The policy draft for this repo is in `docs/privacy-policy.md`, but you still need to publish it on a public webpage before submission.

## Official references

- Expo Android production build: https://docs.expo.dev/tutorial/eas/android-production-build
- Expo app config reference: https://docs.expo.dev/versions/latest/config/app/
- EAS config reference: https://docs.expo.dev/eas/json/
- Google Play Data safety overview: https://support.google.com/googleplay/android-developer/answer/10787469
